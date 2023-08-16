// ==UserScript==
// @name          [Pokeclicker] Enhanced Auto Clicker
// @namespace     Pokeclicker Scripts
// @author        Optimatum (Original/Credit: Ephenia, Ivan Lay, Novie53, andrew951, Kaias26, kevingrillet)
// @description   Clicks through battles, with adjustable speed and a toggle button, and provides various insightful statistics. Also includes an automatic gym battler and automatic dungeon explorer with multiple pathfinding modes, now both with settings to disable graphics for performance.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       3.3

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautoclicker.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautoclicker.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'enhancedautoclicker';
const ticksPerSecond = 20;
const maxClickMultiplier = 5;
// Auto Clicker
var autoClickState = ko.observable(false);
var autoClickMultiplier;
var autoClickerLoop;
// Auto Gym
var autoGymState = ko.observable(false);
var autoGymSelect;
// Auto Dungeon
var autoDungeonState = ko.observable(false);
var autoDungeonMode;
var autoDungeonLootTier;
var dungeonID = 0;
var dungeonFloor;
var dungeonCoords;
var dungeonBossCoords;
var dungeonChestCoords;
var dungeonFloorSize;
var dungeonFlashDistance;
var dungeonFlashCols;
// Clicker statistics calculator
var calculatorLoop;
var calculatorEfficiencyDisplay;
var calculatorDamageDisplay
var calcLastUpdate;
var calcPlayerState = -1;
var calcPlayerLocation;
var calcTicks;
var calcClicks;
var calcEnemies;
var calcAreaHealth;
// Visual settings
var gymGraphicsDisabled = ko.observable(false);
var dungeonGraphicsDisabled = ko.observable(false);

/* Initialization */

function initAutoClicker() {
    const battleView = document.getElementsByClassName('battle-view')[0];

    var elemAC = document.createElement("table");
    elemAC.innerHTML = `<tbody><tr><td colspan="4">
    <button id="auto-click-start" class="btn btn-${autoClickState() ? 'success' : 'danger'} btn-block" style="font-size:8pt;">
    Auto Click [${autoClickState() ? 'ON' : 'OFF'}]<br>
    <div id="auto-click-info">
    <!-- calculator display will be set by resetCalculator() -->
    </div>
    </button>
    <div id="click-rate-cont">
    <div id="auto-click-rate-info">Click Attack Rate: ${(ticksPerSecond * autoClickMultiplier).toLocaleString('en-US', {maximumFractionDigits: 2})}/s</div>
    <input id="auto-click-rate" type="range" min="1" max="${maxClickMultiplier}" value="${autoClickMultiplier}">
    </div>
    </td></tr>
    <tr style="display: flex;">
    <td style="flex: auto;">
    <button id="auto-dungeon-start" class="btn btn-block btn-${autoDungeonState() ? 'success' : 'danger'}" style="font-size: 8pt;">
    Auto Dungeon [${autoDungeonState() ? 'ON' : 'OFF'}]</button>
    </td>
    <td style="display: flex; flex-direction: column;">
  <select id="auto-dungeon-mode" style="flex: auto;">
    <option value="0">F</option>
    <option value="1">B</option>
  </select>
    </td>
    <td style="display: flex; flex-direction: column;">
    <div id="auto-dungeon-loottier" class="dropdown show">
        <button type="button" class="text-left custom-select col-12 btn btn-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="max-height:30px; display:flex; flex:1; align-items:center;">
            <div id="auto-dungeon-loottier-text" ${autoDungeonLootTier > -1 ? 'style="display:none;"' : ''}>None</div>
            <img id="auto-dungeon-loottier-img" src="${autoDungeonLootTier > -1 ? `assets/images/dungeons/chest-${Object.keys(baseLootTierChance)[autoDungeonLootTier]}.png` : ''}" style="height:100%; ${autoDungeonLootTier > -1 ? '' : 'display:none;'}">
        </button>
        <div id="auto-dungeon-loottier-dropdown" class="border-secondary dropdown-menu col-12">
        <div class="dropdown-item dropdown-text" value="-1">None</div>
        ${Object.keys(baseLootTierChance).reduce((options, tier, i) => {
            return options + `<div class="dropdown-item" value="${i}">`
                + `<img src="assets/images/dungeons/chest-${tier}.png"></div>\n`;
        }, '').trim()}
        </div>
    </div>
    </td>
    <td style="flex: auto;">
    <button id="auto-gym-start" class="btn btn-block btn-${autoGymState() ? 'success' : 'danger'}" style="font-size: 8pt;">
    Auto Gym [${autoGymState() ? 'ON' : 'OFF'}]
    </button>
    </td>
    <td style="display: flex; flex-direction: column;">
  <select id="auto-gym-select" style="flex: auto;">
    <option value="0">#1</option>
    <option value="1">#2</option>
    <option value="2">#3</option>
    <option value="3">#4</option>
    <option value="4">#5</option>
  </select>
    </td>
    </tr>
    </tbody>`;

    battleView.before(elemAC);
    resetCalculator(); // initializes calculator display

    var scriptSettings = document.getElementById('settings-scripts');
    // Create scripts settings tab if it doesn't exist yet
    if (!scriptSettings) {
        // Fixes the Scripts nav item getting wrapped to the bottom by increasing the max width of the window
        document.getElementById('settingsModal').querySelector('div').style.maxWidth = '850px';
        // Create and attach script settings tab link
        const settingTabs = document.querySelector('#settingsModal ul.nav-tabs');
        let li = document.createElement('li');
        li.classList.add('nav-item');
        li.innerHTML = `<a class="nav-link" href="#settings-scripts" data-toggle="tab">Scripts</a>`;
        settingTabs.appendChild(li);
        // Create and attach script settings tab contents
        const tabContent = document.querySelector('#settingsModal .tab-content');
        scriptSettings = document.createElement('div');
        scriptSettings.classList.add('tab-pane');
        scriptSettings.setAttribute('id', 'settings-scripts');
        tabContent.appendChild(scriptSettings);
    }

    let table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-hover', 'm-0');
    scriptSettings.prepend(table);
    let header = document.createElement('thead');
    header.innerHTML = '<tr><th colspan="2">Enhanced Auto Clicker</th></tr>';
    table.appendChild(header);
    let settingsBody = document.createElement('tbody');
    settingsBody.setAttribute('id', 'settings-scripts-enhancedautoclicker');
    table.appendChild(settingsBody);

    var settingsElems = [];
    settingsElems.push(document.createElement('tr'));
    settingsElems.at(-1).innerHTML = `<td class="p-2 col-md-8">
        Auto Clicker efficiency display mode
        </td>
        <td class="p-0 col-md-4">
        <select id="select-calculatorEfficiencyDisplay" class="form-control">
        <option value="0">Percentage</option>
        <option value="1">Ticks/s</option>
        </select>
        </td>`;
    settingsElems.push(document.createElement('tr'));
    settingsElems.at(-1).innerHTML = `<td class="p-2 col-md-8">
        Auto Clicker damage display mode
        </td>
        <td class="p-0 col-md-4">
        <select id="select-calculatorDamageDisplay" class="form-control">
        <option value="0">Click Attacks</option>
        <option value="1">Damage</option>
        </select>
        </td>`;
    settingsElems.push(document.createElement('tr'));
    settingsElems.at(-1).innerHTML = `<td class="p-2 col-md-8">
        <label class="m-0" for="checkbox-gymGraphicsDisabled">Disable Auto Gym graphics</label>
        </td><td class="p-2 col-md-4">
        <input id="checkbox-gymGraphicsDisabled" type="checkbox">
        </td>`;
    settingsElems.push(document.createElement('tr'));
    settingsElems.at(-1).innerHTML = `<td class="p-2 col-md-8">
        <label class="m-0" for="checkbox-dungeonGraphicsDisabled">Disable Auto Dungeon graphics</label>
        </td><td class="p-2 col-md-4">
        <input id="checkbox-dungeonGraphicsDisabled" type="checkbox">
        </td>`;

    settingsBody.append(...settingsElems);

    document.getElementById('auto-gym-select').value = autoGymSelect;
    document.getElementById('auto-dungeon-mode').value = autoDungeonMode;
    document.getElementById('select-calculatorEfficiencyDisplay').value = calculatorEfficiencyDisplay;
    document.getElementById('select-calculatorDamageDisplay').value = calculatorDamageDisplay;
    document.getElementById('checkbox-gymGraphicsDisabled').checked = gymGraphicsDisabled();
    document.getElementById('checkbox-dungeonGraphicsDisabled').checked = dungeonGraphicsDisabled();

    document.getElementById('auto-click-start').addEventListener('click', () => { toggleAutoClick(); });
    document.getElementById('auto-click-rate').addEventListener('change', (event) => { changeClickMultiplier(event); });
    document.getElementById('auto-gym-start').addEventListener('click', () => { toggleAutoGym(); });
    document.getElementById('auto-gym-select').addEventListener('change', (event) => { changeSelectedGym(event); });
    document.getElementById('auto-dungeon-start').addEventListener('click', () => { toggleAutoDungeon(); });
    document.getElementById('auto-dungeon-mode').addEventListener('change', (event) => { changeDungeonMode(event); });
    document.getElementById('auto-dungeon-loottier').addEventListener('change', (event) => { changeDungeonLootTier(event); });
    document.getElementById('checkbox-gymGraphicsDisabled').addEventListener('change', (event) => { toggleAutoGymGraphics(event); } );
    document.getElementById('checkbox-dungeonGraphicsDisabled').addEventListener('change', (event) => { toggleAutoDungeonGraphics(event); } );
    document.getElementById('select-calculatorEfficiencyDisplay').addEventListener('change', (event) => { changeCalcEfficiencyDisplay(event); } );
    document.getElementById('select-calculatorDamageDisplay').addEventListener('change', (event) => { changeCalcDamageDisplay(event); } );

    document.querySelectorAll('#auto-dungeon-loottier-dropdown > div').forEach((elem) => {
        elem.addEventListener('click', () => { changeDungeonLootTier(elem.getAttribute('value')); });
    });

    addGlobalStyle('#auto-click-info { display: flex;flex-direction: row;justify-content: center; }');
    addGlobalStyle('#auto-click-info > div { width: 33.3%; }');
    addGlobalStyle('#click-rate-cont { display: flex; flex-direction: column; align-items: stretch;}');
    addGlobalStyle('#auto-dungeon-loottier-dropdown img { max-height: 30px; width: auto; }')

    overrideGymRunner()
    overrideDungeonRunner();

    if (autoClickState()) {
        autoClicker();
    }
}

function addGlobalStyle(css) {
    var head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

/* Settings event handlers */

function toggleAutoClick() {
    const element = document.getElementById('auto-click-start');
    autoClickState(!autoClickState());
    localStorage.setItem('autoClickState', autoClickState());
    autoClickState() ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    autoClicker();
}

function changeClickMultiplier(event) {
    // TODO decide on a better range / function
    const multiplier = +event.target.value;
    if (Number.isInteger(multiplier) && multiplier > 0) {
        autoClickMultiplier = multiplier;
        localStorage.setItem("autoClickMultiplier", autoClickMultiplier);
        var displayNum = (ticksPerSecond * autoClickMultiplier).toLocaleString('en-US', {maximumFractionDigits: 2})
        document.getElementById('auto-click-rate-info').innerText = `Click Attack Rate: ${displayNum}/s`;
        autoClicker();
    }
}

function toggleAutoGym() {
    const element = document.getElementById('auto-gym-start');
    autoGymState(!autoGymState());
    localStorage.setItem('autoGymState', autoGymState());
    autoGymState() ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Auto Gym [${autoGymState() ? 'ON' : 'OFF'}]`;
    if (autoClickState() && !autoGymState()) {
        // Only break out of this script's auto restart, not the built-in one
        GymRunner.autoRestart(false);
    }
}

function changeSelectedGym(event) {
    const val = +event.target.value;
    if ([0, 1, 2, 3, 4].includes(val)) {
        autoGymSelect = val;
        localStorage.setItem("autoGymSelect", autoGymSelect);
        // In case currently fighting a gym
        if (autoClickState() && autoGymState()) {
            // Only break out of this script's auto restart, not the built-in one
            GymRunner.autoRestart(false);
        }
    }
}

function toggleAutoDungeon() {
    const element = document.getElementById('auto-dungeon-start');
    autoDungeonState(!autoDungeonState());
    localStorage.setItem('autoDungeonState', autoDungeonState());
    autoDungeonState() ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Auto Dungeon [${autoDungeonState() ? 'ON' : 'OFF'}]`;
}

function changeDungeonMode(event) {
    const val = +event.target.value;
    // Extra value-has-changed check to avoid repeat pathfinding
    if (val != autoDungeonMode && [0, 1].includes(val)) {
        dungeonCoords = null;
        autoDungeonMode = val;
        localStorage.setItem("autoDungeonMode", autoDungeonMode);
    }
}

function changeDungeonLootTier(tier) {
    const val = +tier;
    if ([-1, ...Object.keys(baseLootTierChance).keys()].includes(val)) {
        autoDungeonLootTier = val;
        if (val > -1) {
            document.getElementById('auto-dungeon-loottier-img').setAttribute('src', `assets/images/dungeons/chest-${Object.keys(baseLootTierChance)[val]}.png`);
            document.getElementById('auto-dungeon-loottier-img').style.removeProperty('display');
            document.getElementById('auto-dungeon-loottier-text').style.setProperty('display', 'none');
        } else {
            document.getElementById('auto-dungeon-loottier-img').setAttribute('src', '');
            document.getElementById('auto-dungeon-loottier-img').style.setProperty('display', 'none');
            document.getElementById('auto-dungeon-loottier-text').style.removeProperty('display');
        }
        
        localStorage.setItem("autoDungeonLootTier", autoDungeonLootTier);
    }
}

function toggleAutoGymGraphics(event) {
    gymGraphicsDisabled(event.target.checked);
    localStorage.setItem('gymGraphicsDisabled', gymGraphicsDisabled());
}

function toggleAutoDungeonGraphics(event) {
    dungeonGraphicsDisabled(event.target.checked);
    localStorage.setItem('dungeonGraphicsDisabled', dungeonGraphicsDisabled());
}

function changeCalcEfficiencyDisplay(event) {
    const val = +event.target.value;
    if (val != calculatorEfficiencyDisplay && [0, 1].includes(val)) {
        calculatorEfficiencyDisplay = val;
        localStorage.setItem('calculatorEfficiencyDisplay', calculatorEfficiencyDisplay);
        resetCalculator();
    }
}

function changeCalcDamageDisplay(event) {
    const val = +event.target.value;
    if (val != calculatorDamageDisplay && [0, 1].includes(val)) {
        calculatorDamageDisplay = val;
        localStorage.setItem('calculatorDamageDisplay', calculatorDamageDisplay);
        resetCalculator();
    }
}

/* Auto Clicker */

/**
 * Resets and, if enabled, restarts autoclicker
 * -While enabled, clicks <ticksPerSecond> times per second in active battle
 * -Outside battles, runs Auto Dungeon and Auto Gym
 */
function autoClicker() {
    var delay = Math.ceil(1000 / ticksPerSecond);
    clearInterval(autoClickerLoop);
    // Restart stats calculator
    calcClickStats();
    // Only use click multiplier while autoclicking
    overrideClickAttack(autoClickState() ? autoClickMultiplier : 1);
    if (autoClickState()) {
        // Start autoclicker loop
        autoClickerLoop = setInterval(function () {
            // Click while in a normal battle
            if (App.game.gameState === GameConstants.GameState.fighting) {
                Battle.clickAttack(autoClickMultiplier);
            }
            // ...or gym battle
            else if (App.game.gameState === GameConstants.GameState.gym) {
                GymBattle.clickAttack(autoClickMultiplier);
            }
            // ...or dungeon battle
            else if (App.game.gameState === GameConstants.GameState.dungeon && DungeonRunner.fighting()) {
                DungeonBattle.clickAttack(autoClickMultiplier);
            }
            // ...or temporary battle
            else if (App.game.gameState === GameConstants.GameState.temporaryBattle) {
                TemporaryBattleBattle.clickAttack(autoClickMultiplier);
            }
            // If not battling, progress through dungeon
            else if (autoDungeonState()) {
                autoDungeon();
            }
            // If not battling gym, start battling
            else if (autoGymState()) {
                autoGym();
            }
            calcTicks[0]++;
        }, delay);
    } else {
        if (autoGymState()) {
            GymRunner.autoRestart(false);
        }
    }
}

/**
 * Override the game's function for Click Attack to:
 * - make multiple clicks at once via multiplier
 * - support changing the attack speed cap for higher tick speeds
 */
function overrideClickAttack(clickMultiplier = 1) {
    // Set delay based on the autoclicker's tick rate
    // (lower to give setInterval some wiggle room)
    var delay = Math.min(Math.ceil(1000 / ticksPerSecond) - 10, 50);
    var clickDamageCached = 0;
    var lastCached = 0;
    Battle.clickAttack = function () {
        // click attacks disabled and we already beat the starter
        if (App.game.challenges.list.disableClickAttack.active() && player.regionStarters[GameConstants.Region.kanto]() != GameConstants.Starter.None) {
            return;
        }
        const now = Date.now();
        if (now - this.lastClickAttack < delay) {
            return;
        }
        this.lastClickAttack = now;
        if (!this.enemyPokemon()?.isAlive()) {
            return;
        }
        // Avoid recalculating damage 20 times per second
        if (now - lastCached > 1000) {
            clickDamageCached = App.game.party.calculateClickAttack(true);
            lastCached = now;
        }
        // Don't autoclick more than needed for lethal
        var clicks = Math.min(clickMultiplier, Math.ceil(this.enemyPokemon().health() / clickDamageCached));
        GameHelper.incrementObservable(App.game.statistics.clickAttacks, clicks);
        this.enemyPokemon().damage(clickDamageCached * clicks);
        if (!this.enemyPokemon().isAlive()) {
            this.defeatPokemon();
        }
    }
}


/* Auto Gym */

/**
 * Starts selected gym with auto restart enabled
 */
function autoGym() {
    if (App.game.gameState === GameConstants.GameState.town) {
        // Find all unlocked gyms in the current town
        var gymList = player.town().content.filter((c) => (c.constructor.name == "Gym" && c.isUnlocked()));
        if (gymList.length > 0) {
            var gymIndex = Math.min(autoGymSelect, gymList.length - 1);
            // Start in auto restart mode
            GymRunner.startGym(gymList[gymIndex], true);
            return;
        }
    }
    // Disable if we aren't in a location with unlocked gyms
    toggleAutoGym();
}

/**
 * Override GymRunner built-in functions:
 * -Add auto gym equivalent of gymWon() to save on performance by not loading town between
 */
function overrideGymRunner() {
    GymRunner.gymWonNormal = GymRunner.gymWon;
    // Version with free auto restart
    GymRunner.gymWonAuto = function(gym) {
        if (GymRunner.running()) {
            GymRunner.running(false);
            // First time defeating this gym
            if (!App.game.badgeCase.hasBadge(gym.badgeReward)) {
                gym.firstWinReward();
            }
            GameHelper.incrementObservable(App.game.statistics.gymsDefeated[GameConstants.getGymIndex(gym.town)]);
            // Award money for defeating gym as we're auto clicking
            App.game.wallet.gainMoney(gym.moneyReward);

            if (GymRunner.autoRestart()) {
                // Unlike the original function, autoclicker doesn't charge the player money
                GymRunner.startGym(GymRunner.gymObservable(), GymRunner.autoRestart(), false);
                return;
            }

            // Send the player back to the town they were in
            player.town(gym.parent);
            App.game.gameState = GameConstants.GameState.town;
        }
    }
    // Only use our version when auto gym is running
    GymRunner.gymWon = function(...args) {
        if (autoClickState() && autoGymState()) {
            GymRunner.gymWonAuto(...args);
        } else {
            GymRunner.gymWonNormal(...args);
        }
    }
}

/* Auto Dungeon */

/**
 * Automatically begins and progresses through dungeons with multiple pathfinding options
 */
function autoDungeon() { // TODO more thoroughly test switching between modes and enabling/disabling within a dungeon
    // Progress through dungeon
    if (App.game.gameState === GameConstants.GameState.dungeon) {
        if (DungeonBattle.catching()) {
            return;
        }
        // Scan each new dungeon floor
        if (dungeonID !== DungeonRunner.dungeonID || dungeonFloor !== DungeonRunner.map.playerPosition().floor) {
            dungeonID = DungeonRunner.dungeonID;
            dungeonCoords = null;
            scan();
        }
        // Reset pathfinding coordinates to entrance
        if (dungeonCoords == null) {
            dungeonCoords = new Point(Math.floor(dungeonFloorSize / 2), dungeonFloorSize - 1);
        }
        // Explore using selected mode
        if (autoDungeonMode == 0) {
            fullClear();
        } else if (autoDungeonMode == 1) {
            seekBoss();
        }
    }
    // Begin dungeon
    else if (App.game.gameState === GameConstants.GameState.town) {
        if (player.town() instanceof DungeonTown) {
            const dungeon = player.town().dungeon;
            // Enter dungeon if unlocked and affordable
            if (dungeon?.isUnlocked() && App.game.wallet.hasAmount(new Amount(dungeon.tokenCost, GameConstants.Currency.dungeonToken))) {
                DungeonRunner.initializeDungeon(dungeon);
                return;
            }
        }
        // Disable if locked, can't afford entry cost, or there's no dungeon here
        toggleAutoDungeon();
    }
}

/**
 * Scans current dungeon floor for relevant locations and pathfinding data
 */
function scan() {
    var dungeonBoard = DungeonRunner.map.board()[DungeonRunner.map.playerPosition().floor];
    dungeonFloor = DungeonRunner.map.playerPosition().floor;
    dungeonFloorSize = DungeonRunner.map.floorSizes[DungeonRunner.map.playerPosition().floor];
    dungeonChestCoords = [];
    // Scan for chest and boss coordinates
    for (var y = 0; y < dungeonBoard.length; y++) {
        for (var x = 0; x < dungeonBoard[y].length; x++) {
            if (dungeonBoard[y][x].type() == GameConstants.DungeonTile.chest) {
                let lootTier = Object.keys(baseLootTierChance).indexOf(dungeonBoard[y][x].metadata.tier);
                dungeonChestCoords.push({'pos': new Point(x, y), 'tier': lootTier});
            }
            if (dungeonBoard[y][x].type() == GameConstants.DungeonTile.boss || dungeonBoard[y][x].type() == GameConstants.DungeonTile.ladder) {
                dungeonBossCoords = new Point(x, y);
            }
        }
    }
    // Sort chests by descending rarity
    dungeonChestCoords.sort((a, b) => b.tier - a.tier);
    // TODO find a more future-proof way to get flash distance
    dungeonFlashDistance = DungeonRunner.map.flash?.playerOffset[0] ?? 0;
    dungeonFlashCols = [];
    // Calculate minimum columns to fully reveal dungeon with Flash
    if (dungeonFlashDistance > 0) {
        var i = 0;
        var j = dungeonFloorSize - 1;
        while (i <= j) {
            dungeonFlashCols.push(Math.min(i + dungeonFlashDistance, j));
            if (i + dungeonFlashDistance < j - dungeonFlashDistance) {
                dungeonFlashCols.push(j - dungeonFlashDistance);
            }
            i += dungeonFlashDistance * 2 + 1;
            j -= dungeonFlashDistance * 2 + 1;
        }
        dungeonFlashCols.sort((a, b) => (a - b));
    }
}

/**
 * Navigate to the boss and fight it as quickly as possible, using only info visible to the player
 */
function seekBoss() {
    const dungeonBoard = DungeonRunner.map.board();
    var hasMoved = false;
    // Seek the boss
    while (!hasMoved) {
        // Boss tile visible
        if (dungeonBoard[dungeonFloor][dungeonBossCoords.y][dungeonBossCoords.x].isVisible) {
            // Boss tile unlocked
            if (dungeonBoard[dungeonFloor][dungeonBossCoords.y][dungeonBossCoords.x].isVisited) {
                let chestIndex;
                if (autoDungeonLootTier > -1) {
                    chestIndex = dungeonChestCoords.findIndex((chest) => 'visibleFrom' in chest && chest.tier >= autoDungeonLootTier);
                } else {
                    chestIndex = -1;
                }
                // Open chests first
                if (chestIndex > -1) {
                    let chest = dungeonChestCoords[chestIndex];
                    // Open chest
                    if (dungeonBoard[dungeonFloor][chest.pos.y][chest.pos.x].isVisited) {
                        // Remove from list
                        dungeonChestCoords.splice(chestIndex, 1);
                        DungeonRunner.map.moveToCoordinates(chest.pos.x, chest.pos.y);
                        DungeonRunner.openChest();
                        hasMoved = true;
                    } 
                    // Proceed to chest
                    else {
                        if (!('movingTowards' in chest)) {
                            dungeonCoords.x = chest.visibleFrom.x;
                            dungeonCoords.y = chest.visibleFrom.y;
                            chest.movingTowards = true;
                        }
                        if (dungeonCoords.y != chest.pos.y) {
                            dungeonCoords.y += (dungeonCoords.y < chest.pos.y ? 1 : -1);
                        }
                        else if (dungeonCoords.x != chest.pos.x) {
                            dungeonCoords.x += (dungeonCoords.x < chest.pos.x ? 1 : -1);
                        }
                    }
                } 
                // Start boss / move floors
                else {
                    DungeonRunner.map.moveToCoordinates(dungeonBossCoords.x, dungeonBossCoords.y);
                    if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.boss) {
                        DungeonRunner.startBossFight();
                    } else if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.ladder) {
                        DungeonRunner.nextFloor();
                    } else {
                        // Just in case
                        console.warn('Auto Dungeon failed to recognize boss tile!');
                        toggleAutoDungeon();
                    }
                    return;
                }
            }
            // Boss visible, move towards it
            else if (dungeonCoords.y != dungeonBossCoords.y) {
                dungeonCoords.y += (dungeonCoords.y < dungeonBossCoords.y ? 1 : -1);
            }
            else if (dungeonCoords.x != dungeonBossCoords.x) {
                dungeonCoords.x += (dungeonCoords.x < dungeonBossCoords.x ? 1 : -1);
            }
        }
        // Boss tile not visible, cover ground
        else {
            // End of column, move to new column
            if (dungeonCoords.y == 0) {
                dungeonCoords.y = dungeonFloorSize - 1;
                if (dungeonCoords.x >= (dungeonFloorSize - 1) - dungeonFlashDistance) {
                    // Done with this side, move to other side of the entrance
                    dungeonCoords.x = Math.floor(dungeonFloorSize / 2) - 1;
                } else {
                    // Move away from the entrance
                    dungeonCoords.x += (dungeonCoords.x >= Math.floor(dungeonFloorSize / 2) ? 1 : -1);
                }
            // Dungeon has Flash unlocked
            } else if (dungeonCoords.y == (dungeonFloorSize - 1) && dungeonFlashDistance > 0) {
                // Skip columns not in optimal flash pathing
                if (dungeonFlashCols.includes(dungeonCoords.x)) {
                    dungeonCoords.y -= 1;
                } else {
                    // Move away from the entrance
                    dungeonCoords.x += (dungeonCoords.x >= Math.floor(dungeonFloorSize / 2) ? 1 : -1);
                }
            }
            // Move through column
            else {
                dungeonCoords.y -= 1;
            }
        }
        // One move per tick to look more natural
        if (!dungeonBoard[dungeonFloor][dungeonCoords.y][dungeonCoords.x].isVisited) {
            DungeonRunner.map.moveToCoordinates(dungeonCoords.x, dungeonCoords.y);
            hasMoved = true;
        }
    }
    // Mark nearby chests
    dungeonChestCoords.filter((chest) => {
        return !('visibleFrom' in chest) && dungeonBoard[dungeonFloor][chest.pos.y][chest.pos.x].isVisible;
    }).forEach((chest) => {
        chest.visibleFrom = new Point(dungeonCoords.x, dungeonCoords.y);
    });
}

/**
 * Fully explores dungeon, opening all chests at end of each floor
 */
function fullClear() {
    // Fully explore floor
    while (dungeonCoords !== -1) {
        // Handles the segment to the right of the entrance
        if ((dungeonCoords.y == dungeonFloorSize - 1) && dungeonCoords.x >= Math.floor(dungeonFloorSize / 2)) {
            if (dungeonCoords.x == dungeonFloorSize - 1) {
                dungeonCoords.x = Math.floor(dungeonFloorSize / 2) - 1;
            } else {
                dungeonCoords.x += 1;
            }
        }
        // Move in one direction until reaching the wall
        else {
            var direction = (-1) ** (dungeonFloorSize - dungeonCoords.y);
            // End of row, move up one
            if ((dungeonCoords.x == (dungeonFloorSize - 1) && direction > 0) ||
                (dungeonCoords.x == 0 && direction < 0)) {
                if (dungeonCoords.y == 0) {
                    // Floor fully explored
                    dungeonCoords = -1;
                    break;
                } else {
                    dungeonCoords.y -= 1;
                }
            } else {
                dungeonCoords.x += direction;
            }
        }
        // One move per tick to look more natural
        if (!DungeonRunner.map.board()[dungeonFloor][dungeonCoords.y][dungeonCoords.x].isVisited) {
            DungeonRunner.map.moveToCoordinates(dungeonCoords.x, dungeonCoords.y);
            return;
        }
        // Just in case changed to allow multiple moves per tick
        else if (DungeonRunner.fighting() || DungeonBattle.catching()) {
            return;
        }
    }
    // Floor explored, open chests
    if (dungeonChestCoords.length > 0 && dungeonChestCoords[0].tier >= autoDungeonLootTier) {
        var chestPos = dungeonChestCoords.shift().pos;
        DungeonRunner.map.moveToCoordinates(chestPos.x, chestPos.y);
        DungeonRunner.openChest();
    }
    // Boss / ladder time
    else {
        DungeonRunner.map.moveToCoordinates(dungeonBossCoords.x, dungeonBossCoords.y);
        if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.boss) {
            DungeonRunner.startBossFight();
        } else if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.ladder) {
            DungeonRunner.nextFloor();
        }
    }
}

/**
 * Override DungeonRunner built-in functions:
 * -Add dungeon ID tracking to initializeDungeon() for easier mapping
 * -Add auto dungeon equivalent of dungeonWon() to save on performance by restarting without loading town
 */
function overrideDungeonRunner() {
    // Differentiate between dungeons for mapping
    DungeonRunner.dungeonID = 0;
    const oldInit = DungeonRunner.initializeDungeon.bind(DungeonRunner);
    DungeonRunner.initializeDungeon = function (...args) {
        DungeonRunner.dungeonID++;
        return oldInit(...args);
    }

    DungeonRunner.dungeonWonNormal = DungeonRunner.dungeonWon;
    // Version with integrated auto-restart to avoid loading town in between dungeons
    DungeonRunner.dungeonWonAuto = function () {
        if (!DungeonRunner.dungeonFinished()) {
            DungeonRunner.dungeonFinished(true);
            // First time clearing dungeon
            if (!App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(DungeonRunner.dungeon.name)]()) {
                DungeonRunner.dungeon.rewardFunction();
            }
            GameHelper.incrementObservable(App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(DungeonRunner.dungeon.name)]);

            // Auto restart dungeon
            if (DungeonRunner.hasEnoughTokens()) {
                // Clear old board to force map visuals refresh
                DungeonRunner.map.board([]);
                DungeonRunner.initializeDungeon(DungeonRunner.dungeon);
                return;
            }

            MapHelper.moveToTown(DungeonRunner.dungeon.name);
        }
    }
    // Only use our version when auto dungeon is running
    DungeonRunner.dungeonWon = function (...args) {
        if (autoClickState() && autoDungeonState()) {
            DungeonRunner.dungeonWonAuto(...args);
        } else {
            DungeonRunner.dungeonWonNormal(...args);
        }
    }
}

/* Clicker statistics calculator */

/**
 * Resets and, if auto clicker is running, restarts calculator
 * Shows the following statistics, averaged over the last ten seconds:
 * -Percentage of ticksPerSecond the autoclicker is actually executing
 * -Clicks per second or damage per second, depending on display mode
 * -Required number of clicks or click attack damage to one-shot the current location, depending on display mode
 * --Ignores dungeon bosses and chest health increases
 * -Enemies defeated per second
 * Statistics are reset when the player changes locations
 */
function calcClickStats() {
    clearInterval(calculatorLoop);
    resetCalculator();
    if (autoClickState()) {
        calculatorLoop = setInterval(function () {
            if (!hasPlayerMoved()) {
                var elem;
                var clickDamage = App.game.party.calculateClickAttack(true);
                var actualElapsed = (Date.now() - calcLastUpdate.at(-1)) / (1000 * calcLastUpdate.length);


                // Percentage of maximum ticksPerSecond
                elem = document.getElementById('tick-efficiency');
                var avgTicks = calcTicks.reduce((a, b) => a + b, 0) / calcTicks.length;
                avgTicks = avgTicks / actualElapsed;
                if (calculatorEfficiencyDisplay == 1) {
                    // display ticks mode
                    elem.innerHTML = avgTicks.toLocaleString('en-US', {maximumFractionDigits: 1} );
                    elem.style.color = 'gold';
                } else {
                    // display percentage mode
                    var tickFraction = avgTicks / ticksPerSecond;
                    elem.innerHTML = tickFraction.toLocaleString('en-US', {style: 'percent', maximumFractionDigits: 0} );
                    elem.style.color = 'gold';
                }

                // Average clicks/damage per second
                elem = document.getElementById('clicks-per-second');
                var avgClicks = (App.game.statistics.clickAttacks() - calcClicks.at(-1)) / calcClicks.length;
                avgClicks = avgClicks / actualElapsed;
                if (calculatorDamageDisplay == 1) {
                    // display damage mode
                    var avgDPS = avgClicks * clickDamage;
                    elem.innerHTML = avgDPS.toLocaleString('en-US', {maximumFractionDigits: 0});
                    elem.style.color = 'gold';
                } else {
                    // display click attacks mode
                    elem.innerHTML = avgClicks.toLocaleString('en-US', {maximumFractionDigits: 1});
                    elem.style.color = 'gold';
                }

                // Required clicks/click damage
                elem = document.getElementById('req-clicks');
                if (calcAreaHealth == 0) {
                    // can't meaningfully calculate a value for this area/game state
                    elem.innerHTML = '-';
                    elem.style.removeProperty('color');
                } else if (calculatorDamageDisplay == 1) {
                    // display damage mode
                    var reqDamage = calcAreaHealth;
                    elem.innerHTML = reqDamage.toLocaleString('en-US');
                    elem.style.color = (clickDamage >= reqDamage ? 'greenyellow' : 'darkred');
                } else {
                    // display clicks mode
                    var reqClicks = Math.max((calcAreaHealth / clickDamage), 1);
                    reqClicks = Math.ceil(reqClicks * 10) / 10; // round up to one decimal point
                    elem.innerHTML = reqClicks.toLocaleString('en-US', {maximumFractionDigits: 1});
                    elem.style.color = (reqClicks == 1 ? 'greenyellow' : 'darkred');
                }

                // Enemies per second
                elem = document.getElementById('enemies-per-second')
                var avgEnemies = (App.game.statistics.totalPokemonDefeated() - calcEnemies.at(-1)) / calcEnemies.length;
                avgEnemies = avgEnemies / actualElapsed;
                elem.innerHTML = avgEnemies.toLocaleString('en-US', {maximumFractionDigits: 1});
                elem.style.color = 'gold';

                // Make room for next second's stats tracking
                // Add new entries to start of array for easier incrementing
                calcTicks.unshift(0);
                if (calcTicks.length > 10) {
                    calcTicks.pop();
                }
                calcClicks.unshift(App.game.statistics.clickAttacks());
                if (calcClicks.length > 10) {
                    calcClicks.pop();
                }
                calcEnemies.unshift(App.game.statistics.totalPokemonDefeated());
                if (calcEnemies.length > 10) {
                    calcEnemies.pop();
                }
                calcLastUpdate.unshift(Date.now());
                if (calcLastUpdate.length > 10) {
                    calcLastUpdate.pop();
                }
            }
            // Reset statistics on area / game state change
            else {
                resetCalculator();
            }
        }, 1000);
    }
}


/**
 * Resets stats trackers and calculator info display
 */
function resetCalculator() {
    calcLastUpdate = [Date.now()];
    calcTicks = [0];
    calcClicks = [App.game.statistics.clickAttacks()];
    calcEnemies = [App.game.statistics.totalPokemonDefeated()];
    playerTown = player.town().name;
    playerRoute = player.route();
    calculateAreaHealth();
    document.getElementById('auto-click-info').innerHTML = `<div>${calculatorEfficiencyDisplay == 0 ? 'Clicker Efficiency' : 'Ticks/s'}:<br><div id="tick-efficiency" style="font-weight:bold;">-</div></div>
        <div>${calculatorDamageDisplay == 0 ? 'Click Attacks/s' : 'DPS'}:<br><div id="clicks-per-second" style="font-weight:bold;">-</div></div>
        <div>Req. ${calculatorDamageDisplay == 0 ? 'Clicks' : 'Click Damage'}:<br><div id="req-clicks" style="font-weight:bold;">-</div></div>
        <div>Enemies/s:<br><div id="enemies-per-second" style="font-weight:bold;">-</div></div>`;
}


/**
 * Check whether player state or location has changed
 */
function hasPlayerMoved() {
    var moved = false;
    if (calcPlayerState != App.game.gameState) {
        calcPlayerState = App.game.gameState;
        moved = true;
    }
    if (calcPlayerState === GameConstants.GameState.gym) {
        if (calcPlayerLocation != GymRunner.gymObservable().leaderName) {
            moved = true;
        }
        calcPlayerLocation = GymRunner.gymObservable().leaderName;
    } else if (calcPlayerState === GameConstants.GameState.dungeon) {
        if (calcPlayerLocation != DungeonRunner.dungeon.name) {
            moved = true;
        }
        calcPlayerLocation = DungeonRunner.dungeon.name;
    } else if (calcPlayerState === GameConstants.GameState.temporaryBattle) {
        if (calcPlayerLocation != TemporaryBattleRunner.battleObservable().name) {
            moved = true;
        }
        calcPlayerLocation = TemporaryBattleRunner.battleObservable().name;
    } else {
        // Conveniently, player.route() = 0 when not on a route
        if (calcPlayerLocation != (player.route() || player.town().name)) {
            moved = true;
        }
        calcPlayerLocation = player.route() || player.town().name;
    }
    return moved;
}

/**
 * Calculate max Pokemon health for the current route/gym/dungeon
 * -Ignores dungeon boss HP and chest HP increases
 */
function calculateAreaHealth() {
    // Calculate area max hp
    if (App.game.gameState === GameConstants.GameState.fighting) {
        calcAreaHealth = PokemonFactory.routeHealth(player.route(), player.region);
        // Adjust for route health variation
        // TODO actually calculate the route's maximum health variation
        calcAreaHealth = Math.round(calcAreaHealth * 1.1);
    } else if (App.game.gameState === GameConstants.GameState.gym) {
        // Get highest health gym pokemon
        calcAreaHealth = GymRunner.gymObservable().getPokemonList().reduce((a, b) => Math.max(a, b.maxHealth), 0);
    } else if (App.game.gameState === GameConstants.GameState.dungeon) {
        calcAreaHealth = DungeonRunner.dungeon.baseHealth;
    } else if (App.game.gameState === GameConstants.GameState.temporaryBattle) {
        // Get highest health trainer pokemon
        calcAreaHealth = TemporaryBattleRunner.battleObservable().getPokemonList().reduce((a, b) => Math.max(a, b.maxHealth), 0);
    } else {
        calcAreaHealth = 0;
    }
}

/* Graphics settings */

/**
 * Add extra Knockout data bindings to optionally disable (most) gym and dungeon graphics
 */
function addGraphicsBindings() {
    // Add computed observable functions
    GymRunner.autoGymOn = ko.pureComputed( () => {
        return autoClickState() && autoGymState();
    });
    GymRunner.disableAutoGymGraphics = ko.pureComputed( () => {
        return gymGraphicsDisabled() && GymRunner.autoGymOn();
    });
    DungeonRunner.disableAutoDungeonGraphics = ko.pureComputed( () => {
        return dungeonGraphicsDisabled() && autoClickState() && autoDungeonState();
    });

    // Add gymView data bindings
    var gymContainer = document.querySelector('div[data-bind="if: App.game.gameState === GameConstants.GameState.gym"]');
    var elemsToBind = ['knockout[data-bind*="pokemonNameTemplate"]', // Pokemon name
        'span[data-bind*="pokemonsDefeatedComputable"]', // Gym Pokemon counter (pt 1)
        'span[data-bind*="pokemonsUndefeatedComputable"]', // Gym Pokemon counter (pt 2)
        'knockout[data-bind*="pokemonSpriteTemplate"]', // Pokemon sprite
        'div.progress.hitpoints', // Pokemon healthbar
        'div.progress.timer' // Gym timer
        ];
    elemsToBind.forEach((query) => {
        var elem = gymContainer.querySelector(query);
        if (elem) {
            elem.before(new Comment("ko ifnot: GymRunner.disableAutoGymGraphics()"));
            elem.after(new Comment("/ko"))
        }
    });
    // Always hide stop button during autoGym, even with graphics enabled
    var restartButton = gymContainer.querySelector('button[data-bind="visible: GymRunner.autoRestart()"]');
    restartButton.setAttribute('data-bind', 'visible: GymRunner.autoRestart() && !GymRunner.autoGymOn()');

    // Add dungeonView data bindings
    var dungeonContainer = document.querySelector('div[data-bind="if: App.game.gameState === GameConstants.GameState.dungeon"]');
    // Title bar contents
    dungeonContainer.querySelector('h2.pageItemTitle')?.prepend(new Comment("ko ifnot: DungeonRunner.disableAutoDungeonGraphics()"));
    dungeonContainer.querySelector('h2.pageItemTitle')?.append(new Comment("/ko"));
    // Main container sprites etc
    dungeonContainer.querySelector('h2.pageItemTitle')?.after(new Comment("ko ifnot: DungeonRunner.disableAutoDungeonGraphics()"));
    dungeonContainer.querySelector('h2.pageItemFooter')?.before(new Comment("/ko"));
}

/* Initializing variables from localStorage */

/**
 * Loads variable from localStorage
 * -Returns value from localStorage if it exists and is correct type
 * -Otherwise returns null
 */
function validateStorage(key, type) {
    try {
        var val = localStorage.getItem(key);
        val = JSON.parse(val);
        if (val == null || typeof val !== type) {
            throw new Error();
        }
        return val;
    } catch (e) {
        return null;
    }
}

// Auto Clicker
autoClickState(validateStorage('autoClickState', 'boolean') ?? false);
autoClickMultiplier = validateStorage('autoClickMultiplier', 'number') ?? 1;
if (!(Number.isInteger(autoClickMultiplier) && autoClickMultiplier >= 1)) {
    autoClickMultiplier = 1;
}

// Auto Gym
autoGymState(validateStorage('autoGymState', 'boolean') ?? false);
autoGymSelect = validateStorage('autoGymSelect', 'number') ?? 0;
if (![0, 1, 2, 3, 4].includes(autoGymSelect)) {
    autoGymSelect = 0;
}

// Auto Dungeon
autoDungeonState(validateStorage('autoDungeonState', 'boolean') ?? false);
autoDungeonMode = validateStorage('autoDungeonMode', 'number') ?? 0;
if (![0, 1].includes(autoDungeonMode)) {
    autoDungeonMode = 0;
}
autoDungeonLootTier = validateStorage('autoDungeonLootTier', 'number') ?? -1;
if(![-1, ...Object.keys(baseLootTierChance).keys()].includes(autoDungeonLootTier)) {
    autoDungeonLootTier = -1;
}

// Stats calculator
calculatorEfficiencyDisplay = validateStorage('calculatorEfficiencyDisplay', 'number') ?? 0;
if (![0, 1].includes(calculatorEfficiencyDisplay)) {
    calculatorEfficiencyDisplay = 0;
}
calculatorDamageDisplay = validateStorage('calculatorDamageDisplay', 'number') ?? 0;
if (![0, 1].includes(calculatorDamageDisplay)) {
    calculatorDamageDisplay = 0;
}

// Graphics settings
gymGraphicsDisabled(validateStorage('gymGraphicsDisabled', 'boolean') ?? false);
dungeonGraphicsDisabled(validateStorage('dungeonGraphicsDisabled', 'boolean') ?? false);

/* Load script */

// Add data bindings before the game initializes Knockout
addGraphicsBindings();

function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args);
        if (App.game && !hasInitialized) {
            initAutoClicker();
            hasInitialized = true;
        }
        return result;
    }
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
