/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
/* eslint-disable no-undef */
// ==UserScript==
// @name          [Pokeclicker] Auto Safari Zone
// @namespace     Pokeclicker Scripts
// @author        Kanzen01 (Credit: Ephenia)
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

let autoSafariState;
let autoSafariPickState;
let autoSafariFastAnimationsState;
let autoSafariThrowBaitsState;
let autoSafariCatchAllState;

// Tells when we try to pick items and skip fights or run away when only 1 ball left
let gettingItems = false;
// To skip items if they are generated in buggy sections of the grid
let forceSkipItems = false;
// Flag to track if entrance fee payment is ongoing since we are playing with timeouts
let isPayingEntranceFee = false;

let autoSafariProcessId;

const GRASS_GRID_VALUE = 10;

function initAutoSafari() {
  createHTML();

  function checkSafariEntry() {
    if (player.town() instanceof Town && !player.route() && (player.town().name === 'Friend Safari' || player.town().name === 'Safari Zone')) {
      if (Safari.canAccess() && Safari.canPay()) {
        isPayingEntranceFee = true;
        openModalAndPayEntranceFee().then(() => {
          isPayingEntranceFee = false;
        });
      } else {
        toggleAutoSafari()
      }
    } else {
      toggleAutoSafari()
    }
  }

  function openModalAndPayEntranceFee() {
    return new Promise((resolve) => {
      setTimeout(() => {
        Safari.openModal();
        setTimeout(() => {
          Safari.payEntranceFee();
          resolve(); // Signal that the process is complete
        }, 500);
      }, 500);
    });
  }

  function processSafari() {
    // Performs actions within the Safari : picking items, moving, fighting pokemons

    if (!Safari.inBattle()) {
      if (autoSafariPickState && Safari.itemGrid().length > 0 && Safari.balls() == 1 && !forceSkipItems) {
        gettingItems = true // trying to get items, helps to skip fights
        const shortestPath = findShortestPathToTiles(Safari.itemGrid().map(({ x, y }) => [y, x]), skipFights = true);
        if (shortestPath) {
          moveCharacterWithDelay(shortestPath);
        } else {
          forceSkipItems = true // if items are generated in buggy sections of the map, skip them...
        }
      } else {
        gettingItems = false
        const shortestPath = findShortestPathToValue(GRASS_GRID_VALUE);
        if (shortestPath) {
          moveCharacterWithDelay(shortestPath);
        }
      }
    } else {
      fightSafariPokemon();
    }
  }

  function moveCharacterWithDelay(shortestPath) {
    // TODO this method needs some refactoring since it does not use the complete path but it is called again after every step
    // if a grass tile is isolated and the character is walking on it, it will go back and forth on it and lose half of its time moving on an empty tile
    let moveIndex = 0;

    function moveNextStep() {
      if (moveIndex < shortestPath.length) {
        Safari.step(shortestPath[moveIndex]);
        moveIndex += 1;
      }

    }

    moveNextStep();
  }

  function findShortestPathToValue(target) {
    // find all tiles of a certain value
    tiles = findTilesWithValue(target);
    return findShortestPathToTiles(tiles);
  }

  function findShortestPathToTiles(targetPositions, skipFights = false) {
    const numRows = Safari.grid.length;
    const numCols = Safari.grid[0].length;
    const visited = new Set();
    const queue = [[Safari.playerXY.y, Safari.playerXY.x, []]];

    const isValidPosition = (row, col) => row >= 0 && row < numRows && col >= 0 && col < numCols;

    while (queue.length > 0) {
      const [currentRow, currentCol, currentPath] = queue.shift();
      visited.add(`${currentRow}-${currentCol}`);

      const isCurrentPositionTarget = targetPositions.some(
        ([targetRow, targetCol]) => currentRow === targetRow && currentCol === targetCol,
      );

      if (isCurrentPositionTarget && currentPath.length > 0) {
        // Found the closest target, return the path
        return currentPath;
      }

      const directions = [
        [currentRow - 1, currentCol, 'up'],
        [currentRow + 1, currentCol, 'down'],
        [currentRow, currentCol - 1, 'left'],
        [currentRow, currentCol + 1, 'right'],
      ];

      for (const [nextRow, nextCol, direction] of directions) {
        const nextPosStr = `${nextRow}-${nextCol}`;

        if (
          isValidPosition(nextRow, nextCol)
          && !visited.has(nextPosStr)
          && GameConstants.LEGAL_WALK_BLOCKS.includes(Safari.grid[nextRow][nextCol]
          )
        ) {
          if (skipFights && Safari.grid[nextRow][nextCol] === GRASS_GRID_VALUE
            && !targetPositions.some(
              ([targetRow, targetCol]) => nextRow === targetRow && nextCol === targetCol,
            )) {
            // To dodge fights while trying to pick all items, unless item is on grass
          } else {
            const nextPath = [...currentPath, direction];
            queue.push([nextRow, nextCol, nextPath]);
            visited.add(nextPosStr);
          }
        }
      }
    }
    return null;
  }

  function findTilesWithValue(targetValue) {
    // find all positions of tiles based on their id
    const numRows = Safari.grid.length;
    const numCols = Safari.grid[0].length;
    const targetPositions = [];

    for (let row = 0; row < numRows; row += 1) {
      for (let col = 0; col < numCols; col += 1) {
        if (Safari.grid[row][col] === targetValue) {
          targetPositions.push([row, col]);
        }
      }
    }

    return targetPositions;
  }

  function fightSafariPokemon(forceRunAway = gettingItems) {
    if (autoSafariThrowBaitsState && App.game.statistics.safariBaitThrown() <= 1000) {
      SafariBattle.throwBait();
    } else if (!forceRunAway
      && autoSafariCatchAllState
      || (App.game.party.getPokemon(SafariBattle.enemy.id)?.pokerus !== GameConstants.Pokerus.Uninfected
        && App.game.party.getPokemon(SafariBattle.enemy.id)?.evs() < 50)
      || SafariBattle.enemy.shiny
      || !App.game.party.alreadyCaughtPokemon(SafariBattle.enemy.id)
      // temporary condition to not skip lots of items if we use multiple pokeballs on the last fight, need to find something cleaner
      || (Safari.balls() < 3 && Safari.itemGrid().length > 3)
    ) {
      if (SafariBattle.enemy.angry === 0) {
        SafariBattle.throwRock();
      } else {
        SafariBattle.throwBall();
      }
    } else {
      SafariBattle.run();
    }
  }

  function createHTML() {
    const safariModal = document.getElementById('safariModal');
    const modalHeader = safariModal.querySelector('.modal-header');

    const buttonsContainer = document.createElement('div');

    const createButton = (name, state, func) => {
      var button = document.createElement('button');
      button.setAttribute('id', `auto-${name}-toggle`);
      button.classList.add('btn', 'btn-block', 'btn-' + (state ? 'success' : 'danger'));
      button.style.height = '50%';
      button.style.fontSize = '8pt';
      button.style.marginTop = '0px';
      button.textContent = `Auto ${name[0].toUpperCase() + name.slice(1)}\n[${state ? 'ON' : 'OFF'}]`;
      button.onclick = function () { func(); };

      buttonsContainer.appendChild(button);
    }

    createButton('safari', autoSafariState, toggleAutoSafari)
    createButton('pick-items', autoSafariPickState, toggleAutoPickItems)
    createButton('fast-anim', autoSafariFastAnimationsState, toggleFastAnimations)
    createButton('throw-baits', autoSafariThrowBaitsState, toggleThrowBaits)
    createButton('catch-all', autoSafariCatchAllState, toggleCatchAll)

    buttonsContainer.style.display = 'flex';
    modalHeader.after(buttonsContainer);

    const safariQuitBtn = safariModal.querySelector('button[onclick="Safari.closeModal()"]');
    safariQuitBtn.addEventListener('click', () => {
      if (autoSafariState) {
        toggleAutoSafari();
      }
    });

    if (autoSafariFastAnimationsState) {
      autoSafariFastAnimations()
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
      // Process safari only if button in ON
      autoSafariProcessId = setInterval(() => {
        if (!isPayingEntranceFee & !Safari.inProgress()) {
          checkSafariEntry();
        } else if (Safari.inProgress()) {
          processSafari();
        }
      }, 250); // Happens every 0.25 seconds (= moving animation speed)
    } else {
      if (autoSafariProcessId) { clearInterval(autoSafariProcessId) }
    }
  }

  function toggleAutoPickItems() {
    autoSafariPickState = !autoSafariPickState;
    const toggleButton = document.getElementById('auto-pick-items-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariPickState);
    toggleButton.classList.toggle('btn-success', autoSafariPickState);
    localStorage.setItem('autoSafariPickState', autoSafariPickState);
    document.getElementById('auto-pick-items-toggle').innerHTML = `Auto Pick-items [${autoSafariPickState ? 'ON' : 'OFF'}]`;
  }

  function toggleFastAnimations() {
    autoSafariFastAnimationsState = !autoSafariFastAnimationsState;
    const toggleButton = document.getElementById('auto-fast-anim-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariFastAnimationsState);
    toggleButton.classList.toggle('btn-success', autoSafariFastAnimationsState);
    localStorage.setItem('autoSafariFastAnimationsState', autoSafariFastAnimationsState);
    document.getElementById('auto-fast-anim-toggle').innerHTML = `Auto Fast-anim [${autoSafariFastAnimationsState ? 'ON' : 'OFF'}]`;

    autoSafariFastAnimations()
  }

  function autoSafariFastAnimations() {
    SafariBattle.Speed.animation = autoSafariFastAnimationsState ? 0 : 1000;
    SafariBattle.Speed.ballBounce = autoSafariFastAnimationsState ? 0 : 750;
    SafariBattle.Speed.ballThrow = autoSafariFastAnimationsState ? 0 : 850;
    SafariBattle.Speed.ballRoll = autoSafariFastAnimationsState ? 0 : 700;
    SafariBattle.Speed.enemyTransition = autoSafariFastAnimationsState ? 0 : 1000;
  }

  function toggleThrowBaits() {
    autoSafariThrowBaitsState = !autoSafariThrowBaitsState;
    const toggleButton = document.getElementById('auto-throw-baits-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariThrowBaitsState);
    toggleButton.classList.toggle('btn-success', autoSafariThrowBaitsState);
    localStorage.setItem('autoSafariThrowBaitsState', autoSafariThrowBaitsState);
    document.getElementById('auto-throw-baits-toggle').innerHTML = `Auto Throw-baits [${autoSafariThrowBaitsState ? 'ON' : 'OFF'}]`;
  }
  function toggleCatchAll() {
    autoSafariCatchAllState = !autoSafariCatchAllState;
    const toggleButton = document.getElementById('auto-catch-all-toggle');
    toggleButton.classList.toggle('btn-danger', !autoSafariCatchAllState);
    toggleButton.classList.toggle('btn-success', autoSafariCatchAllState);
    localStorage.setItem('autoSafariCatchAllState', autoSafariCatchAllState);
    document.getElementById('auto-catch-all-toggle').innerHTML = `Auto Catch-all [${autoSafariCatchAllState ? 'ON' : 'OFF'}]`;
  }
}


// Set to false by default
localStorage.setItem('autoSafariState', false);

if (!localStorage.getItem('autoSafariPickState')) {
  localStorage.setItem('autoSafariPickState', false);
}
if (!localStorage.getItem('autoSafariFastAnimationsState')) {
  localStorage.setItem('autoSafariFastAnimationsState', false);
}
if (!localStorage.getItem('autoSafariThrowBaitsState')) {
  localStorage.setItem('autoSafariThrowBaitsState', false);
}
if (!localStorage.getItem('autoSafariCatchAllState')) {
  localStorage.setItem('autoSafariCatchAllState', false);
}
autoSafariState = JSON.parse(localStorage.getItem('autoSafariState'));
autoSafariPickState = JSON.parse(localStorage.getItem('autoSafariPickState'));
autoSafariFastAnimationsState = JSON.parse(localStorage.getItem('autoSafariFastAnimationsState'));
autoSafariThrowBaitsState = JSON.parse(localStorage.getItem('autoSafariThrowBaitsState'));
autoSafariCatchAllState = JSON.parse(localStorage.getItem('autoSafariCatchAllState'));

function loadScript() {
  const oldInit = Preload.hideSplashScreen;

  Preload.hideSplashScreen = function () {
    const result = oldInit.apply(this, arguments);
    initAutoSafari();
    return result;
  };
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
  loadScript();
}
