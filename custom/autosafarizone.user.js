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

const scriptName = 'autosafarizone';

let autoSafariState;
let safAutoPickState;
let fastAnimationsState;
let characterMovementSpeed;

const grassGridValue = 10;
const reachableGridValues = [0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

function initAutoSafari() {
  createHTML();

  setInterval(() => {
    if (autoSafariState === 'ON' && !Safari.inProgress()) {
      checkSafariEntry();
    } else if (autoSafariState === 'ON' && Safari.inProgress()) {
      processSafari();
    }
  }, 500); // Happens every 0.5 seconds

  function checkSafariEntry() {
    if (player.town() instanceof Town && !player.route() && (player.town().name === 'Friend Safari' || player.town().name === 'Safari Zone')) {
      const townViewContainer = document.getElementById('townView');
      if (townViewContainer) {
        let safariEnterBtn = null;

        const buttons = townViewContainer.getElementsByTagName('button');
        for (const button of buttons) {
          if (button.textContent.includes('Enter Safari Zone')) {
            safariEnterBtn = button;
            break;
          }
        }

        if (safariEnterBtn) {
          if (safariEnterBtn.offsetParent !== null && safariEnterBtn.offsetWidth > 0 && safariEnterBtn.offsetHeight > 0) {
            safariEnterBtn.click();
          }
        }
      }

      const safariPayEntranceBtn = document.getElementById('paySafariButton');

      const computedStyle = window.getComputedStyle(safariPayEntranceBtn);
      if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && safariPayEntranceBtn.offsetHeight > 0) {
        safariPayEntranceBtn.click();
      }
    }
  }

  function processSafari() {
    // Performs actions within the Safari : picking items, moving, fighting pokemons

    if (Safari.inBattle() !== true) {
      if (safAutoPickState === 'ON' && Safari.itemGrid().length > 0) {
        const shortestPath = findShortestPathToTiles(Safari.itemGrid().map(({ x, y }) => [y, x]));
        if (shortestPath) {
          moveCharacterWithDelay(shortestPath);
        }
      } else {
        const shortestPath = findShortestPathToValue(grassGridValue);
        if (shortestPath) {
          moveCharacterWithDelay(shortestPath);
        }
      }
    } else {
      fightSafariPokemon();
    }
  }

  function moveCharacterWithDelay(shortestPath) {
    let moveIndex = 0;

    function moveNextStep() {
      if (moveIndex < shortestPath.length) {
        moveCharacter(shortestPath[moveIndex]);
        moveIndex += 1;

        setTimeout(moveNextStep, characterMovementSpeed, shortestPath);
      }
    }

    moveNextStep();
  }

  function findShortestPathToValue(target) {
    // find all tiles of a certain value
    tiles = findTilesWithValue(target);
    return findShortestPathToTiles(tiles);
  }

  function findShortestPathToTiles(targetPositions) {
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
                    && reachableGridValues.includes(Safari.grid[nextRow][nextCol])
        ) {
          const nextPath = [...currentPath, direction];
          queue.push([nextRow, nextCol, nextPath]);
          visited.add(nextPosStr);
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

  function fightSafariPokemon() {
    if (App.game.party.getPokemon(SafariBattle.enemy.id)?.pokerus !== GameConstants.Pokerus.Uninfected && App.game.party.getPokemon(SafariBattle.enemy.id)?.evs() < 50) {
      if (SafariBattle.enemy.angry === 0) { SafariBattle.throwRock(); } else { SafariBattle.throwBall(); }
    } else { SafariBattle.run(); }
  }

  function moveCharacter(direction) {
    Safari.step(direction);
  }

  function createHTML() {
    const safariModal = document.getElementById('safariModal');
    const modalHeader = safariModal.querySelector('.modal-header');

    const buttonsContainer = document.createElement('div');

    // Auto safari button
    const autoSafariBtn = document.createElement('button');
    autoSafariBtn.setAttribute('id', 'saf-auto-btn');
    autoSafariBtn.classList.add('btn', 'btn-block', autoSafariState === 'OFF' ? 'btn-danger' : 'btn-success');
    autoSafariBtn.style.fontSize = '8pt';
    autoSafariBtn.style.width = '50%';
    autoSafariBtn.textContent = `Auto Safari [${autoSafariState}]`;
    autoSafariBtn.addEventListener('click', () => { toggleAutoSafari(); });

    // Auto pick items button
    const pickItemsBtn = document.createElement('button');
    pickItemsBtn.setAttribute('id', 'saf-auto-pick-btn');
    pickItemsBtn.classList.add('btn', 'btn-block', safAutoPickState === 'OFF' ? 'btn-danger' : 'btn-success');
    pickItemsBtn.style.fontSize = '8pt';
    pickItemsBtn.style.width = '50%';
    pickItemsBtn.style.marginTop = '0px';
    pickItemsBtn.textContent = `Auto Pick Items [${safAutoPickState}]`;
    pickItemsBtn.addEventListener('click', () => { toggleAutoPickItems(); });

    // Fast animations button
    const fastAnimationsBtn = document.createElement('button');
    fastAnimationsBtn.setAttribute('id', 'saf-fast-anim-btn');
    fastAnimationsBtn.classList.add('btn', 'btn-block', fastAnimationsState === 'OFF' ? 'btn-danger' : 'btn-success');
    fastAnimationsBtn.style.fontSize = '8pt';
    fastAnimationsBtn.style.width = '50%';
    fastAnimationsBtn.style.marginTop = '0px';
    fastAnimationsBtn.textContent = `Fast Animations [${fastAnimationsState}]`;
    fastAnimationsBtn.addEventListener('click', () => { toggleFastAnimations(); });

    buttonsContainer.style.display = 'flex';

    buttonsContainer.appendChild(autoSafariBtn);
    buttonsContainer.appendChild(pickItemsBtn);
    buttonsContainer.appendChild(fastAnimationsBtn);

    modalHeader.after(buttonsContainer);

    const safariQuitBtn = safariModal.querySelector('button[onclick="Safari.closeModal()"]');
    safariQuitBtn.addEventListener('click', () => {
      if (autoSafariState === 'ON') {
        toggleAutoSafari();
      }
    });
  }

  function toggleAutoSafari() {
    if (autoSafariState === 'OFF') {
      autoSafariState = 'ON';
      document.getElementById('saf-auto-btn').classList.remove('btn-danger');
      document.getElementById('saf-auto-btn').classList.add('btn-success');
    } else {
      autoSafariState = 'OFF';
      document.getElementById('saf-auto-btn').classList.remove('btn-success');
      document.getElementById('saf-auto-btn').classList.add('btn-danger');
    }
    localStorage.setItem('autoSafariState', autoSafariState);
    document.getElementById('saf-auto-btn').innerHTML = `Auto Safari [${autoSafariState}]`;
  }

  function toggleAutoPickItems() {
    if (safAutoPickState === 'OFF') {
      safAutoPickState = 'ON';
      document.getElementById('saf-auto-pick-btn').classList.remove('btn-danger');
      document.getElementById('saf-auto-pick-btn').classList.add('btn-success');
    } else {
      safAutoPickState = 'OFF';
      document.getElementById('saf-auto-pick-btn').classList.remove('btn-success');
      document.getElementById('saf-auto-pick-btn').classList.add('btn-danger');
    }
    localStorage.setItem('safAutoPickState', safAutoPickState);
    document.getElementById('saf-auto-pick-btn').innerHTML = `Auto Pick Items [${safAutoPickState}]`;
  }

  function toggleFastAnimations() {
    if (fastAnimationsState === 'OFF') {
      fastAnimationsState = 'ON';
      document.getElementById('saf-fast-anim-btn').classList.remove('btn-danger');
      document.getElementById('saf-fast-anim-btn').classList.add('btn-success');

      SafariBattle.Speed.animation = 0;
      SafariBattle.Speed.ballBounce = 0;
      SafariBattle.Speed.ballThrow = 0;
      SafariBattle.Speed.ballRoll = 0;
      SafariBattle.Speed.enemyTransition = 0;
      characterMovementSpeed = 0;
    } else {
      fastAnimationsState = 'OFF';
      document.getElementById('saf-fast-anim-btn').classList.remove('btn-success');
      document.getElementById('saf-fast-anim-btn').classList.add('btn-danger');

      // Reset to default values
      SafariBattle.Speed.animation = 1000;
      SafariBattle.Speed.ballBounce = 750;
      SafariBattle.Speed.ballThrow = 850;
      SafariBattle.Speed.ballRoll = 700;
      SafariBattle.Speed.enemyTransition = 1000;
      characterMovementSpeed = 250;
    }
    localStorage.setItem('fastAnimationsState', fastAnimationsState);
    document.getElementById('saf-fast-anim-btn').innerHTML = `Fast Animations [${fastAnimationsState}]`;
  }
}

if (localStorage.getItem('autoSafariState') == null) {
  localStorage.setItem('autoSafariState', 'OFF');
}
if (localStorage.getItem('safAutoPickState') == null) {
  localStorage.setItem('safAutoPickState', 'OFF');
}
if (localStorage.getItem('fastAnimationsState') == null) {
  localStorage.setItem('fastAnimationsState', 'OFF');
}
autoSafariState = localStorage.getItem('autoSafariState');
safAutoPickState = localStorage.getItem('safAutoPickState');
fastAnimationsState = localStorage.getItem('fastAnimationsState');

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
