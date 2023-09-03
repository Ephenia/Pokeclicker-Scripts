/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
/* eslint-disable no-undef */
// ==UserScript==
// @name          [Pokeclicker] Auto Safari Zone
// @namespace     Pokeclicker Scripts
// @author        Kanzen01 (Credit: Ephenia, Optimatum)
// @description   Adds in toggable options to move/catch pokemons/pick up items and have fast animations on both safari zones
// @copyright     https://github.com/Kanzen01
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/autosafarizone.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/autosafarizone.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'autosafarizone';

function initAutoSafari() {
  var autoSafariState = false;
  var autoSafariPickItemsState = loadSetting('autoSafariPickItemsState', true);
  var autoSafariThrowBaitsState = loadSetting('autoSafariThrowBaitsState', false);
  var autoSafariSeekUncaught = loadSetting('autoSafariSeekUncaught', false);
  var autoSafariSeekContagious = loadSetting('autoSafariSeekContagious', false);
  var autoSafariFastAnimationsState = loadSetting('autoSafariFastAnimationsState', false);

  var cachedPath = [];
  // Tells when we try to pick items and skip fights or run away when only 1 ball left
  var gettingItems = false;
  // To skip items if they are generated in buggy sections of the grid
  var forceSkipItems = false;
  var hasPriority = false;
  var inBattle = false;

  var autoSafariProcessId;
  var skipTicks = 0;

  const CACHED_ANIM_SPEEDS = Object.assign({}, SafariBattle.Speed);
  const CACHED_MOVE_SPEED = Safari.moveSpeed;
  // Faux enum
  const DIRECTIONS = {
    up: 0,
    down: 1,
    left: 2,
    right: 3,
    0: 'up',
    1: 'down',
    2: 'left',
    3: 'right',
  };

  createHTML();

  function startAutoSafari() {
    gettingItems = false;
    forceSkipItems = false;
    cachedPath.length = 0;
    // Interval slightly longer than movement speed (0.25s by default) to avoid graphical glitches
    autoSafariProcessId = setInterval(doSafariTick, tickSpeed());
  }

  function doSafariTick() {
    if (skipTicks) {
      skipTicks--;
    } else if (!Safari.inProgress() || modalUtils.observableState.safariModal !== 'show') {
      enterSafari();
    } else if (Safari.inBattle()) {
      fightSafariPokemon();
    } else {
      processSafari();
    }
  }

  function tickSpeed() {
    return Safari.moveSpeed + 25;
  }

  function enterSafari() {
    if (!(Safari.canAccess() && !player.route() && ['Safari Zone', 'Friend Safari'].includes(player.town().name))) {
      toggleAutoSafari();
      return;
    }
    if (modalUtils.observableState.safariModal !== 'show') {
      Safari.openModal();
      skipTicks = autoSafariFastAnimationsState ? 2 : 1;
    } else if (!Safari.inProgress() && Safari.canPay()) {
      Safari.payEntranceFee();
      forceSkipItems = false;
      cachedPath.length = 0;
    } else {
      toggleAutoSafari();
    }
  }

  function processSafari() {
    // Performs actions within the Safari: picking items, moving
    inBattle = false;
    if (autoSafariPickItemsState && Safari.itemGrid().length > 0 && Safari.balls() == 1 && !forceSkipItems) {
      if (!gettingItems) {
        cachedPath.length = 0;
        gettingItems = true; // trying to pick up items, set to skip fights
      }
      if (!cachedPath.length) {
        cachedPath = findShortestPathToItems();
      }
      if (cachedPath.length) {
        moveCharacter(cachedPath);
      } else {
        forceSkipItems = true;
      }
    } else {
      if (gettingItems) {
        cachedPath.length = 0;
        gettingItems = false;
      }
      if (!cachedPath.length) {
        cachedPath = findShortestPathToEncounters();
      }
      if (cachedPath.length) {
        moveCharacter(cachedPath);
      } else {
        // Hopefully never possible
        toggleAutoSafari();
      }
    }
  }

  function moveCharacter(path) {
    if (!Safari.isMoving) {
      let dir = path.shift();
      Safari.step(DIRECTIONS[dir]);
    }
  }

  function findShortestPathToItems() {
    const itemLocations = new Set(Safari.itemGrid().map(({ x, y }) => `${y}-${x}`));
    return findShortestPathToTiles((row, col) => (itemLocations.has(`${row}-${col}`)));
  }

  function findShortestPathToEncounters() {
    // If prioritizing uncaught/contagious, check if water and grass encounters have any
    function isPriority(mon) {
      return (autoSafariSeekUncaught && !App.game.party.alreadyCaughtPokemonByName(mon)) ||
        (autoSafariSeekContagious && App.game.party.getPokemonByName(mon)?.pokerus === GameConstants.Pokerus.Contagious);
    }

    let needGrass = false;
    let needWater = false;

    if (autoSafariSeekUncaught || autoSafariSeekContagious) {
      needGrass = SafariPokemonList.list[player.region]().some((p) => p.environments.includes(SafariEnvironments.Grass) && isPriority(p.name));
      needWater = SafariPokemonList.list[player.region]().some((p) => p.environments.includes(SafariEnvironments.Water) && isPriority(p.name));
    }
    
    hasPriority = needGrass || needWater;

    let chosenTiles = [];
    if (needGrass) {
      chosenTiles.push(GameConstants.SafariTile.grass);
    }
    if (needWater) {
      chosenTiles.push(...GameConstants.SAFARI_WATER_BLOCKS);
    }
    if (!needGrass && !needWater) {
      // No priority, either 
      chosenTiles.push(GameConstants.SafariTile.grass, ...GameConstants.SAFARI_WATER_BLOCKS);
    }
    
    const encounterTiles = new Set(chosenTiles);
    return findShortestPathToTiles((row, col) => (encounterTiles.has(Safari.grid[row][col])) && !isIsolatedTile(row, col));
  }

  function isIsolatedTile(row, col) {
    const tileType = Safari.grid[row][col];
    const adjacentTiles = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ];

    var compareFunc;
    if (GameConstants.SafariTile.waterUL <= tileType && tileType <= GameConstants.SafariTile.waterDR) {
      compareFunc = (t) => GameConstants.SAFARI_WATER_BLOCKS.includes(t);
    } else if (GameConstants.SafariTile.sandUL <= tileType && tileType <= GameConstants.SafariTile.sandULinverted) {
      compareFunc = (t) => GameConstants.SafariTile.sandUL <= t && t <= GameConstants.SafariTile.sandULinverted;
    } else if (GameConstants.SafariTile.fenceUL <= tileType && tileType <= GameConstants.SafariTile.fenceDLend) {
      compareFunc = (t) => GameConstants.SafariTile.fenceUL <= t && t <= GameConstants.SafariTile.fenceDLend;
    } else if (GameConstants.SafariTile.treeTopL <= tileType && tileType <= GameConstants.SafariTile.treeRootsR) {
      compareFunc = (t) => GameConstants.SafariTile.treeTopL <= t && t <= GameConstants.SafariTile.treeRootsR;
    } else {
      compareFunc = (t) => t === tileType;
    }

    for (const [adjRow, adjCol] of adjacentTiles) {
      if (isValidPosition(adjRow, adjCol) && compareFunc(Safari.grid[row][col], Safari.grid[adjRow][adjCol])) {
        return false; // Found an adjacent tile with the same value
      }
    }

    return true; // No adjacent tile with the same value found
  }

  function isValidPosition(row, col) {
    const numRows = Safari.grid.length;
    const numCols = Safari.grid[0].length;
    return row >= 0 && row < numRows && col >= 0 && col < numCols;
  }

  // Using the given test function, returns a path to the closest tile satisfying it
  function findShortestPathToTiles(isPositionTarget) {
    const visited = new Set();
    const queue = [[Safari.playerXY.y, Safari.playerXY.x, []]];

    while (queue.length > 0) {
      const [currentRow, currentCol, currentPath] = queue.shift();
      visited.add(`${currentRow}-${currentCol}`);

      if (currentPath.length > 0 && isPositionTarget(currentRow, currentCol)) {
        // Found the closest target, return the path
        return currentPath;
      }

      const adjacent = [
        [currentRow - 1, currentCol, DIRECTIONS.up],
        [currentRow + 1, currentCol, DIRECTIONS.down],
        [currentRow, currentCol - 1, DIRECTIONS.left],
        [currentRow, currentCol + 1, DIRECTIONS.right],
      ];

      for (const [nextRow, nextCol, direction] of adjacent) {
        const nextPosStr = `${nextRow}-${nextCol}`;

        // TODO remove SAFARI_WATER_BLOCKS after game update makes it redundant
        if (isValidPosition(nextRow, nextCol) && !visited.has(nextPosStr)
          && (GameConstants.SAFARI_LEGAL_WALK_BLOCKS.includes(Safari.grid[nextRow][nextCol])
            || GameConstants.SAFARI_WATER_BLOCKS.includes(Safari.grid[nextRow][nextCol]))
        ) {
          {
            const nextPath = currentPath.concat([direction]);
            queue.push([nextRow, nextCol, nextPath]);
            visited.add(nextPosStr);
          }
        }
      }
    }
    return [];
  }

  function fightSafariPokemon() {
    // TODO skip ticks proportional to animation speed
    const forceRunAway = gettingItems || (Safari.balls() == 1 && Safari.itemGrid().length > 0 && !forceSkipItems);
    const isPriority = (autoSafariSeekUncaught && !App.game.party.alreadyCaughtPokemon(SafariBattle.enemy.id))
        || (autoSafariSeekContagious && App.game.party.getPokemon(SafariBattle.enemy.id)?.pokerus === GameConstants.Pokerus.Contagious);

    if (SafariBattle.busy()) {
      return;
    } else if (!inBattle) {
      // Delay first action to reduce animation bugs
      inBattle = true;
      if (autoSafariFastAnimationsState) {
        skipTicks += 1;
      }
      return;
    }
    
    // Handle shiny encounters specially
    if (SafariBattle.enemy.shiny) {
      let canNanab = App.game.farming.berryList[BerryType.Nanab]() > 5;
      let canRazz = App.game.farming.berryList[BerryType.Razz]() > 5;
      // Bait is usually the best approach
      if (!(SafariBattle.enemy.angry || SafariBattle.enemy.eating || SafariBattle.enemy.eatingBait !== BaitType.Bait)) {
        // Nanab is highest catch chance, though not highest catch-per-ball efficiency
        if (canNanab) {
          SafariBattle.selectedBait(BaitList.Nanab);
          SafariBattle.throwBait();
        } 
        // Razz is second best
        else if (canRazz) {
          SafariBattle.selectedBait(BaitList.Razz);
          SafariBattle.throwBait();
        } 
        // Bait is still alright if we have plenty of balls left
        else if (Safari.balls() > 2) {
          SafariBattle.selectedBait(BaitList.Bait);
          SafariBattle.throwBait();
        }
        // Throw rock and hope for the best
        else {
          SafariBattle.throwRock();
        }
      }
      // Running low on balls, throw rock (stacks with berry modifiers)
      else if (!SafariBattle.enemy.angry && Safari.balls() <= 2) {
        SafariBattle.throwRock();
      }
      // Catch time, hopefully!
      else {
        SafariBattle.throwBall();
      }
    }
    // Not shiny
    // Throw regular bait to grind achievement
    else if (autoSafariThrowBaitsState && !isPriority && App.game.statistics.safariBaitThrown() < 1000) {
      SafariBattle.selectedBait(BaitList.Bait);
      SafariBattle.throwBait();
    }
    // Flee if looking for specific pokemon or gathering items before using the last safari ball
    else if (forceRunAway || (hasPriority && !isPriority)) {
      SafariBattle.run();
    }
    // Use rock/bait to increase catch chance
    else if (SafariBattle.enemy.angry === 0) { 
      // Turn 1, use berry bait on prioritized pokemon to improve catch chance
      // (SafariBattle.enemy.eatingBait defaults to BaitType.Bait even before feeding)
      if (autoSafariThrowBaitsState && isPriority && !(SafariBattle.enemy.eating || SafariBattle.enemy.eatingBait !== BaitType.Bait)) {
        SafariBattle.selectedBait(BaitList.Bait);
        // Nanab into rock is best combo of catch chance and efficient ball use
        // Don't waste Nanabs if they won't improve catch rate over just rocks
        if (App.game.farming.berryList[BerryType.Nanab]() > 25 && SafariBattle.enemy.catchFactor < 100 / (2 + SafariBattle.enemy.levelModifier)) {
          SafariBattle.selectedBait(BaitList.Nanab);
        } 
        // Razz into rock is second best
        else if (App.game.farming.berryList[BerryType.Razz]() > 25) {
          SafariBattle.selectedBait(BaitList.Razz);
        }
        // Use berry if one was selected
        if (SafariBattle.selectedBait() != BaitList.Bait) {
          SafariBattle.throwBait();
          return;
        }
      }
      // Bait not relevant or already used, rock time
      SafariBattle.throwRock();
    }
    // Try to catch!
    else {
      // If this is the last ball, add some delay to avoid breaking the safari exiting process 
      if (Safari.balls() == 1) {
        skipTicks += 6 * (autoSafariFastAnimationsState ? 2 : 1);
      }
      SafariBattle.throwBall();
    }
  }

  function autoSafariFastAnimations() {
    for (const anim of Object.keys(SafariBattle.Speed)) {
      SafariBattle.Speed[anim] = autoSafariFastAnimationsState ? CACHED_ANIM_SPEEDS[anim] / 2 : CACHED_ANIM_SPEEDS[anim];
    }
    Safari.moveSpeed = autoSafariFastAnimationsState ? CACHED_MOVE_SPEED / 2 : CACHED_MOVE_SPEED;

    if (autoSafariState) {
      clearInterval(autoSafariProcessId);
      startAutoSafari();
    }
  }

  function createHTML() {
    const safariModal = document.getElementById('safariModal');
    const modalHeader = safariModal.querySelector('.modal-header');

    const buttonsContainer = document.createElement('div');

    const createButton = (name, text, state, func) => {
      var button = document.createElement('button');
      button.setAttribute('id', `auto-${name}-toggle`);
      button.classList.add('btn', 'btn-block', 'btn-' + (state ? 'success' : 'danger'));
      button.setAttribute('style', 'font-size: 8pt; display: flex; align-items: center; justify-content: center; margin: 0px !important;')
      button.textContent = `Auto ${text}\n[${state ? 'ON' : 'OFF'}]`;
      button.onclick = function () { func(); };

      buttonsContainer.appendChild(button);
    }

    createButton('safari', 'Safari', autoSafariState, toggleAutoSafari);
    createButton('pick-items', 'Pick Items', autoSafariPickItemsState, toggleAutoPickItems);
    createButton('throw-baits', 'Throw Bait', autoSafariThrowBaitsState, toggleThrowBaits);
    createButton('seek-uncaught', 'Seek New', autoSafariSeekUncaught, toggleSeekUncaught);
    createButton('seek-contagious', 'Seek PKRS', autoSafariSeekContagious, toggleSeekContagious);
    createButton('fast-anim', 'Fast Anim', autoSafariFastAnimationsState, toggleFastAnimations);

    buttonsContainer.setAttribute('style', 'display: flex; height: 24px;')
    buttonsContainer.style.display = 'flex';
    modalHeader.after(buttonsContainer);

    const safariQuitBtn = safariModal.querySelector('button[onclick="Safari.closeModal()"]');
    safariQuitBtn.addEventListener('click', () => {
      if (autoSafariState) {
        toggleAutoSafari();
      }
    });

    if (autoSafariFastAnimationsState) {
      autoSafariFastAnimations();
    }
  }

  function toggleAutoSafari() {
    autoSafariState = !autoSafariState;
    const toggleButton = document.getElementById('auto-safari-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariState);
    toggleButton.classList.toggle('btn-success', autoSafariState);
    localStorage.setItem('autoSafariState', autoSafariState);
    document.getElementById('auto-safari-toggle').innerHTML = `Auto Safari [${autoSafariState ? 'ON' : 'OFF'}]`;

    if (autoSafariState) {
      startAutoSafari();
    } else {
      clearInterval(autoSafariProcessId);
    }
  }

  function toggleAutoPickItems() {
    autoSafariPickItemsState = !autoSafariPickItemsState;
    const toggleButton = document.getElementById('auto-pick-items-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariPickItemsState);
    toggleButton.classList.toggle('btn-success', autoSafariPickItemsState);
    localStorage.setItem('autoSafariPickItemsState', autoSafariPickItemsState);
    document.getElementById('auto-pick-items-toggle').innerHTML = `Auto Pick Items [${autoSafariPickItemsState ? 'ON' : 'OFF'}]`;
  }

  function toggleThrowBaits() {
    autoSafariThrowBaitsState = !autoSafariThrowBaitsState;
    const toggleButton = document.getElementById('auto-throw-baits-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariThrowBaitsState);
    toggleButton.classList.toggle('btn-success', autoSafariThrowBaitsState);
    localStorage.setItem('autoSafariThrowBaitsState', autoSafariThrowBaitsState);
    document.getElementById('auto-throw-baits-toggle').innerHTML = `Auto Throw Bait [${autoSafariThrowBaitsState ? 'ON' : 'OFF'}]`;
  }

  function toggleSeekUncaught() {
    autoSafariSeekUncaught = !autoSafariSeekUncaught;
    const toggleButton = document.getElementById('auto-seek-uncaught-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariSeekUncaught);
    toggleButton.classList.toggle('btn-success', autoSafariSeekUncaught);
    localStorage.setItem('autoSafariSeekUncaught', autoSafariSeekUncaught);
    document.getElementById('auto-seek-uncaught-toggle').innerHTML = `Auto Seek New [${autoSafariSeekUncaught ? 'ON' : 'OFF'}]`;
  }


  function toggleSeekContagious() {
    autoSafariSeekContagious = !autoSafariSeekContagious;
    const toggleButton = document.getElementById('auto-seek-contagious-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariSeekContagious);
    toggleButton.classList.toggle('btn-success', autoSafariSeekContagious);
    localStorage.setItem('autoSafariSeekContagious', autoSafariSeekContagious);
    document.getElementById('auto-seek-contagious-toggle').innerHTML = `Auto Seek PKRS [${autoSafariSeekContagious ? 'ON' : 'OFF'}]`;
  }

  function toggleFastAnimations() {
    autoSafariFastAnimationsState = !autoSafariFastAnimationsState;
    const toggleButton = document.getElementById('auto-fast-anim-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariFastAnimationsState);
    toggleButton.classList.toggle('btn-success', autoSafariFastAnimationsState);
    localStorage.setItem('autoSafariFastAnimationsState', autoSafariFastAnimationsState);
    document.getElementById('auto-fast-anim-toggle').innerHTML = `Auto Fast Anim [${autoSafariFastAnimationsState ? 'ON' : 'OFF'}]`;

    autoSafariFastAnimations();
  }
}

function loadSetting(key, defaultVal) {
    var val;
    try {
        val = JSON.parse(localStorage.getItem(key));
        if (val == null || typeof val !== typeof defaultVal) {
            throw new Error;
        }
    } catch {
        val = defaultVal;
        localStorage.setItem(key, defaultVal);
    }
    return val;
}

function loadScript() {
  const oldInit = Preload.hideSplashScreen;
  var hasInitialized = false;

  Preload.hideSplashScreen = function (...args) {
    const result = oldInit.apply(this, args);
    if (App.game && !hasInitialized) {
      initAutoSafari();
      hasInitialized = true;
    }
    return result;
  };
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
  loadScript();
}
