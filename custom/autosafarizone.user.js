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

  var scriptState = -1;
  var targetCoords = [];
  var cachedPath = [];
  // To skip targets generated in buggy sections of the grid (theoretically can't happen anymore)
  var forceSkipItems = false;
  var forceSkipShinies = [];
  // To avoid constantly checking the spawn list. -1 for confirmed none, 1 for confirmed some
  var hasPrioritySpawns = 0;
  // Cached encounter tile(s) with highest priority spawn chance
  var cachedPriorityEnvironments = [SafariEnvironments.Grass];
  // To add delay to start of battles to avoid animation issues
  var inBattle = false;

  var autoSafariProcessId;
  var skipTicks = 0;

  const CACHED_ANIM_SPEEDS = Object.assign({}, SafariBattle.Speed);
  const CACHED_MOVE_SPEED = Safari.moveSpeed;
  // Faux enums
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
  const SCRIPT_STATES = {
    inactive: -1,
    outside: 0, // Player not in Safari
    encounters: 1,
    gettingItems: 2,
    seekingShiny: 3,
  };

  createHTML();

  function startAutoSafari() {
    scriptState = SCRIPT_STATES.inactive;
    cachedPath.length = 0;
    targetCoords.length = 0;
    forceSkipItems = false;
    forceSkipShinies.length = 0;
    hasPrioritySpawns = 0;
    inBattle = false;
    // Interval slightly longer than movement speed (0.25s by default) to avoid graphical glitches
    autoSafariProcessId = setInterval(doSafariTick, tickSpeed());
  }

  function doSafariTick() {
    if (skipTicks) {
      skipTicks--;
    } else if (!Safari.inProgress() || Safari.activeRegion() !== player.region || modalUtils.observableState.safariModal !== 'show') {
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
      // Safari inaccessible from here
      toggleAutoSafari();
      return;
    } else if (Safari.inProgress() && Safari.activeRegion() !== player.region) {
      // Active session elsewhere, player can re-enable script after confirming reset
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
      hasPrioritySpawns = 0;
    } else {
      toggleAutoSafari();
    }
  }

  function processSafari() {
    // Performs actions within the Safari: picking items, moving
    inBattle = false;

    // Seek visible shiny spawns
    if (Safari.pokemonGrid().some((p) => p.shiny && !forceSkipShinies.includes(p))) {
      // Calculate path to shiny if state changed, no current path, or current path doesn't lead to a wild shiny
      if (scriptState !== SCRIPT_STATES.seekingShiny || !cachedPath?.length || (targetCoords?.length == 2 && !Safari.pokemonGrid().some((p) => p.y == targetCoords[0] && p.x == targetCoords[1]))) {
        scriptState = SCRIPT_STATES.seekingShiny;
        [targetCoords, cachedPath] = findShortestPathToShiny();
      }
      if (cachedPath?.length) {
        moveCharacter(cachedPath);
      } else {
        // Cry
        Safari.pokemonGrid().filter((p) => p.shiny && !forceSkipShinies.includes(p)).forEach((p) => {
          console.log(`autosafarizone: Skipping inaccessible shiny ${p.name} at coordinates (${p.x}, ${p.y}) ${isValidPosition(p.y, p.x) ? `on tile type ${GameConstants.SafariTile[Safari.grid[p.y][p.x]]}` : 'out of bounds'}`);
          forceSkipShinies.push(p);
        });
      }
    }
    // Pick up items before ending the safari
    else if (autoSafariPickItemsState && Safari.itemGrid().length > 0 && Safari.balls() == 1 && !forceSkipItems) {
      // Calculate path to nearest item if state changed, no current path, or current path doesn't lead to an item
      if (scriptState !== SCRIPT_STATES.gettingItems || !cachedPath?.length || (targetCoords?.length == 2 && !Safari.itemGrid().some((i) => i.y == targetCoords[0] && i.x == targetCoords[1]))) {
        scriptState = SCRIPT_STATES.gettingItems;
        [targetCoords, cachedPath] = findShortestPathToItems();
      }
      if (cachedPath?.length) {
        moveCharacter(cachedPath);
      } else {
        forceSkipItems = true;
      }
    }
    // Seek encounters
    else {
      if (scriptState !== SCRIPT_STATES.encounters || !cachedPath?.length) {
        scriptState = SCRIPT_STATES.encounters;
        [targetCoords, cachedPath] = findShortestPathToEncounters();
      }
      if (cachedPath?.length) {
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

  function findShortestPathToShiny() {
    const shinyLocations = new Set(Safari.pokemonGrid().filter((p) => p.shiny).map(({ x, y }) => `${y}-${x}`));
    return findShortestPathToTiles((row, col) => (shinyLocations.has(`${row}-${col}`)));
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

    var chosenTiles;

    // When prioritizing certain spawns, seek the tile type with the highest chance of priority spawns
    if ((autoSafariSeekUncaught || autoSafariSeekContagious) && hasPrioritySpawns > -1) {
      if (hasPrioritySpawns == 0) {
        let grassPriorityWeight = 0;
        let waterPriorityWeight = 0;
        let grassTotalWeight = 0;
        let waterTotalWeight = 0;

        SafariPokemonList.list[player.region]().forEach((p) => {
          if (p.environments.includes(SafariEnvironments.Grass)) {
            grassTotalWeight += p.weight;
          }
          if (p.environments.includes(SafariEnvironments.Water)) {
            waterTotalWeight += p.weight;
          }
          if (isPriority(p.name)) {
            if (p.environments.includes(SafariEnvironments.Grass)) {
              grassPriorityWeight += p.weight;
            }
            if (p.environments.includes(SafariEnvironments.Water)) {
              waterPriorityWeight += p.weight;
            }
          }
        });

        let grassPriorityChance = grassPriorityWeight / grassTotalWeight;
        let waterPriorityChance = waterPriorityWeight / waterTotalWeight;
        if (grassPriorityChance == waterPriorityChance) {
          cachedPriorityEnvironments = [GameConstants.SafariTile.grass, ...GameConstants.SAFARI_WATER_BLOCKS];
        } else if (grassPriorityChance > waterPriorityChance) {
          cachedPriorityEnvironments = [GameConstants.SafariTile.grass];
        } else {
          cachedPriorityEnvironments = [...GameConstants.SAFARI_WATER_BLOCKS];
        }

        hasPrioritySpawns = (grassPriorityWeight == 0 && waterPriorityWeight == 0) ? -1 : 1;
      }
      chosenTiles = cachedPriorityEnvironments;
    } else {
      chosenTiles = [GameConstants.SafariTile.grass, ...GameConstants.SAFARI_WATER_BLOCKS];
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
      if (isValidPosition(adjRow, adjCol) && compareFunc(Safari.grid[adjRow][adjCol])) {
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
        return [[currentRow, currentCol], currentPath];
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
    return [null, null];
  }

  function fightSafariPokemon() {
    // TODO skip ticks proportional to animation speed
    const forceRunAway = (scriptState !== SCRIPT_STATES.encounters || (Safari.balls() == 1 && Safari.itemGrid().length > 0 && !forceSkipItems)) && !SafariBattle.enemy.shiny;
    const isPriority = (autoSafariSeekUncaught && !App.game.party.alreadyCaughtPokemon(SafariBattle.enemy.id))
        || (autoSafariSeekContagious && App.game.party.getPokemon(SafariBattle.enemy.id)?.pokerus === GameConstants.Pokerus.Contagious);
    let threwBall = false;

    if (SafariBattle.busy()) {
      return;
    } else if (!inBattle) {
      // Delay first action to reduce animation bugs
      inBattle = true;
      if (autoSafariFastAnimationsState) {
        skipTicks += 1;
      }
      // Remove any bugged Safari Ball animations
      document.querySelectorAll('#safariBattleModal #safariBall').forEach((ball) => ball.remove());
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
        threwBall = true;
        SafariBattle.throwBall();
      }
    }
    // Not shiny
    // Throw regular bait to grind achievement
    else if (autoSafariThrowBaitsState && !isPriority && App.game.statistics.safariBaitThrown() < 1000) {
      SafariBattle.selectedBait(BaitList.Bait);
      SafariBattle.throwBait();
    }
    // Flee if looking for specific pokemon or if gathering items before using the last safari ball
    else if (forceRunAway || ((autoSafariSeekUncaught || autoSafariSeekContagious) && hasPrioritySpawns == 1 && !isPriority)) {
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
      SafariBattle.throwBall();
      threwBall = true;
    }
    // Handle implications of using a ball
    if (threwBall) {
      // Handle Safari game over
      if (Safari.balls() <= 0) {
        // Add some delay to avoid breaking the safari exiting process
        skipTicks += Math.ceil(40 * (autoSafariFastAnimationsState ? 2 : 1) * SafariBattle.tierMultiplier(Safari.safariLevel()));
        // Just in case the negative balls glitch returns
        if (Safari.balls() < 0) {
          SafariBattle.gameOver();
        }
      }
      // In case we caught a priority spawn, recalculate the optimal encounter tiles next time 
      else if (isPriority && hasPrioritySpawns == 1) {
        hasPrioritySpawns = 0;
      } 
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
      button.classList.add('btn', 'btn-block', `btn-${state ? 'success' : 'danger'}`);
      button.setAttribute('style', 'font-size: 8pt; display: flex; align-items: center; justify-content: center; margin: 0px !important;');
      button.textContent = `Auto ${text}\n[${state ? 'ON' : 'OFF'}]`;
      button.onclick = func;

      buttonsContainer.appendChild(button);
    };

    createButton('safari', 'Safari', autoSafariState, toggleAutoSafari);
    createButton('pick-items', 'Pick Items', autoSafariPickItemsState, toggleAutoPickItems);
    createButton('throw-baits', 'Throw Bait', autoSafariThrowBaitsState, toggleThrowBaits);
    createButton('seek-uncaught', 'Seek New', autoSafariSeekUncaught, toggleSeekUncaught);
    createButton('seek-contagious', 'Seek PKRS', autoSafariSeekContagious, toggleSeekContagious);
    createButton('fast-anim', 'Fast Anim', autoSafariFastAnimationsState, toggleFastAnimations);

    buttonsContainer.setAttribute('style', 'display: flex; height: 24px;');
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

    // Check for priority pokemon again
    hasPrioritySpawns = 0;
  }


  function toggleSeekContagious() {
    autoSafariSeekContagious = !autoSafariSeekContagious;
    const toggleButton = document.getElementById('auto-seek-contagious-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariSeekContagious);
    toggleButton.classList.toggle('btn-success', autoSafariSeekContagious);
    localStorage.setItem('autoSafariSeekContagious', autoSafariSeekContagious);
    document.getElementById('auto-seek-contagious-toggle').innerHTML = `Auto Seek PKRS [${autoSafariSeekContagious ? 'ON' : 'OFF'}]`;

    // Check for priority pokemon again
    hasPrioritySpawns = 0;
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
