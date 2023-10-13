// ==UserScript==
// @name          [Pokeclicker] Enhanced Auto Clicker
// @namespace     Pokeclicker Scripts
// @author        Optimatum (Original/Credit: Ephenia, Ivan Lay, Novie53, andrew951, Kaias26, kevingrillet)
// @description   Clicks through battles, with adjustable speed, and provides various insightful statistics. Also includes an automatic gym battler and automatic dungeon explorer with multiple pathfinding modes.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       3.4

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
var autoDungeonEncounterMode;
var autoDungeonChestMode;
var autoDungeonLootTier;
var autoDungeonAlwaysOpenRareChests;
var autoDungeonTracker = {
    ID: 0,
    floor: null,
    floorSize: null,
    flashTier: null,
    flashCols: null,
    flashPatterns: {'-1': [[0, 0]],
        '0': [[-1, 0], [0, -1], [1, 0]],
        '1': [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0]],
        '2': [[-2, 0], [-1, -1], [0, -2], [1, -1], [2, 0]],
    },
    coords: null,
    bossCoords: null,
    encounterCoords: null,
    chestCoords: null,
    floorExplored: false,
    floorFinished: false,
};
// Clicker statistics calculator
var autoClickCalcLoop;
var autoClickCalcEfficiencyDisplayMode;
var autoClickCalcDamageDisplayMode;
var autoClickCalcTracker = {
    lastUpdate: null,
    playerState: -1,
    playerLocation: null,
    ticks: null,
    clicks: null,
    enemies: null,
    areaHealth: null,
};
// Visual settings
var gymGraphicsDisabled = ko.observable(false);
var dungeonGraphicsDisabled = ko.observable(false);

/* Initialization */

function initAutoClicker() {
    const battleView = document.getElementsByClassName('battle-view')[0];

    var elemAC = document.createElement("table");
    elemAC.innerHTML = `<tbody>
    <tr>
        <td colspan="4">
            <button id="auto-click-start" class="btn btn-${autoClickState() ? 'success' : 'danger'} btn-block" style="font-size:8pt;">
                Auto Click [${autoClickState() ? 'ON' : 'OFF'}]<br />
                <div id="auto-click-info">
                    <!-- calculator display will be set by resetCalculator() -->
                </div>
            </button>
            <div id="click-rate-cont">
                <div id="auto-click-rate-info">
                    Click Attack Rate: ${(ticksPerSecond * autoClickMultiplier).toLocaleString('en-US', {maximumFractionDigits: 2})}/s
                </div>
                <input id="auto-click-rate" type="range" min="1" max="${maxClickMultiplier}" value="${autoClickMultiplier}">
            </div>
        </td>
    </tr>
    <tr>
        <td style="display: flex; column-gap: 2px;">
            <div style="flex: auto;">
                <button id="auto-dungeon-start" class="btn btn-block btn-${autoDungeonState() ? 'success' : 'danger'}" style="font-size: 8pt;">
                    Auto Dungeon [${autoDungeonState() ? 'ON' : 'OFF'}]
                </button>
            </div>
            <div id="auto-dungeon-encounter-mode" style="flex: initial; max-height: 30px; max-width: 30px; padding: 2px;">
                <img title="Auto Dungeon fights mode" src="assets/images/dungeons/encounter.png" height="100%" style="${autoDungeonEncounterMode ? '' : 'filter: grayscale(100%);'}" />
            </div>
            <div id="auto-dungeon-chest-mode" style="flex: initial; max-height: 30px; max-width: 40px; padding: 2px;">
                <img title="Auto Dungeon chest mode" src="assets/images/dungeons/chest.png" height="100%" style="${autoDungeonChestMode ? '' : 'filter: grayscale(100%)'}" />
            </div>
            <div style="flex: initial; display: flex; flex-direction: column;">
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
            </div>
            <div style="flex: auto; margin-right: 2px;">
                <button id="auto-gym-start" class="btn btn-block btn-${autoGymState() ? 'success' : 'danger'}" style="font-size: 8pt;">
                    Auto Gym [${autoGymState() ? 'ON' : 'OFF'}]
                </button>
            </div>
            <div style="flex: initial; display: flex; flex-direction: column;">
                <select id="auto-gym-select" style="flex: auto;">
                    <option value="0">#1</option>
                    <option value="1">#2</option>
                    <option value="2">#3</option>
                    <option value="3">#4</option>
                    <option value="4">#5</option>
                </select>
            </div>
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
        <select id="select-autoClickCalcEfficiencyDisplayMode" class="form-control">
        <option value="0">Percentage</option>
        <option value="1">Ticks/s</option>
        </select>
        </td>`;
    settingsElems.push(document.createElement('tr'));
    settingsElems.at(-1).innerHTML = `<td class="p-2 col-md-8">
        Auto Clicker damage display mode
        </td>
        <td class="p-0 col-md-4">
        <select id="select-autoClickCalcDamageDisplayMode" class="form-control">
        <option value="0">Click Attacks</option>
        <option value="1">Damage</option>
        </select>
        </td>`;
    settingsElems.push(document.createElement('tr'));
    settingsElems.at(-1).innerHTML = `<td class="p-2 col-md-8">
        <label class="m-0" for="checkbox-autoDungeonAlwaysOpenRareChests">Always open visible chests of set rarity and up</label>
        </td><td class="p-2 col-md-4">
        <input id="checkbox-autoDungeonAlwaysOpenRareChests" type="checkbox">
        </td>`;
    settingsElems.push(document.createElement('tr'));
    settingsElems.at(-1).innerHTML = `<td class="p-2 col-md-8">
        <label class="m-0" for="checkbox-autoGymGraphicsDisabled">Disable Auto Gym graphics</label>
        </td><td class="p-2 col-md-4">
        <input id="checkbox-autoGymGraphicsDisabled" type="checkbox">
        </td>`;
    settingsElems.push(document.createElement('tr'));
    settingsElems.at(-1).innerHTML = `<td class="p-2 col-md-8">
        <label class="m-0" for="checkbox-autoDungeonGraphicsDisabled">Disable Auto Dungeon graphics</label>
        </td><td class="p-2 col-md-4">
        <input id="checkbox-autoDungeonGraphicsDisabled" type="checkbox">
        </td>`;

    settingsBody.append(...settingsElems);

    document.getElementById('auto-gym-select').value = autoGymSelect;
    //document.getElementById('auto-dungeon-encounter-mode').checked = autoDungeonEncounterMode;
    //document.getElementById('auto-dungeon-chest-mode').checked = autoDungeonChestMode;
    document.getElementById('checkbox-autoDungeonAlwaysOpenRareChests').checked = autoDungeonAlwaysOpenRareChests;
    document.getElementById('checkbox-autoGymGraphicsDisabled').checked = gymGraphicsDisabled();
    document.getElementById('checkbox-autoDungeonGraphicsDisabled').checked = dungeonGraphicsDisabled();
    document.getElementById('select-autoClickCalcEfficiencyDisplayMode').value = autoClickCalcEfficiencyDisplayMode;
    document.getElementById('select-autoClickCalcDamageDisplayMode').value = autoClickCalcDamageDisplayMode;

    document.getElementById('auto-click-start').addEventListener('click', () => { toggleAutoClick(); });
    document.getElementById('auto-click-rate').addEventListener('change', (event) => { changeClickMultiplier(event); });
    document.getElementById('auto-gym-start').addEventListener('click', () => { toggleAutoGym(); });
    document.getElementById('auto-gym-select').addEventListener('change', (event) => { changeSelectedGym(event); });
    document.getElementById('auto-dungeon-start').addEventListener('click', () => { toggleAutoDungeon(); });
    document.getElementById('auto-dungeon-encounter-mode').addEventListener('click', () => { toggleAutoDungeonEncounterMode(); });
    document.getElementById('auto-dungeon-chest-mode').addEventListener('click', () => { toggleAutoDungeonChestMode(); });
    document.getElementById('checkbox-autoDungeonAlwaysOpenRareChests').addEventListener('change', () => { toggleAutoDungeonAlwaysOpenRareChests(); });
    document.getElementById('checkbox-autoGymGraphicsDisabled').addEventListener('change', () => { toggleAutoGymGraphics(); });
    document.getElementById('checkbox-autoDungeonGraphicsDisabled').addEventListener('change', () => { toggleAutoDungeonGraphics(); });
    document.getElementById('select-autoClickCalcEfficiencyDisplayMode').addEventListener('change', (event) => { changeCalcEfficiencyDisplayMode(event); });
    document.getElementById('select-autoClickCalcDamageDisplayMode').addEventListener('change', (event) => { changeCalcDamageDisplayMode(event); });

    document.querySelectorAll('#auto-dungeon-loottier-dropdown > div').forEach((elem) => {
        elem.addEventListener('click', () => { changeAutoDungeonLootTier(elem.getAttribute('value')); });
    });

    addGlobalStyle('#auto-click-info { display: flex; flex-direction: row; justify-content: center; }');
    addGlobalStyle('#auto-click-info > div { width: 33.3%; }');
    addGlobalStyle('#click-rate-cont { display: flex; flex-direction: column; align-items: stretch; }');
    addGlobalStyle('#auto-dungeon-loottier-dropdown img { max-height: 30px; width: auto; }');

    overrideGymRunner();
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
        var displayNum = (ticksPerSecond * autoClickMultiplier).toLocaleString('en-US', {maximumFractionDigits: 2});
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
    if (autoDungeonState()) {
        // Trigger a dungeon scan
        autoDungeonTracker.ID = -1;
    }
}

function toggleAutoDungeonEncounterMode() {
    autoDungeonEncounterMode = !autoDungeonEncounterMode;
    $('#auto-dungeon-encounter-mode img').css('filter', `${autoDungeonEncounterMode ? '' : 'grayscale(100%)' }`);
    localStorage.setItem('autoDungeonEncounterMode', autoDungeonEncounterMode);
    autoDungeonTracker.coords = null;
}

function toggleAutoDungeonChestMode() {
    autoDungeonChestMode = !autoDungeonChestMode;
    $('#auto-dungeon-chest-mode img').css('filter', `${autoDungeonChestMode ? '' : 'grayscale(100%)' }`);
    localStorage.setItem('autoDungeonChestMode', autoDungeonChestMode);
    autoDungeonTracker.coords = null;
}

function changeAutoDungeonLootTier(tier) {
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

function toggleAutoDungeonAlwaysOpenRareChests() {
    autoDungeonAlwaysOpenRareChests = !autoDungeonAlwaysOpenRareChests;
    localStorage.setItem('autoDungeonAlwaysOpenRareChests', autoDungeonAlwaysOpenRareChests);
}

function toggleAutoGymGraphics() {
    gymGraphicsDisabled(!gymGraphicsDisabled());
    localStorage.setItem('gymGraphicsDisabled', gymGraphicsDisabled());
}

function toggleAutoDungeonGraphics() {
    dungeonGraphicsDisabled(!dungeonGraphicsDisabled());
    localStorage.setItem('dungeonGraphicsDisabled', dungeonGraphicsDisabled());
}

function changeCalcEfficiencyDisplayMode(event) {
    const val = +event.target.value;
    if (val != autoClickCalcEfficiencyDisplayMode && [0, 1].includes(val)) {
        autoClickCalcEfficiencyDisplayMode = val;
        localStorage.setItem('autoClickCalcEfficiencyDisplayMode', autoClickCalcEfficiencyDisplayMode);
        resetCalculator();
    }
}

function changeCalcDamageDisplayMode(event) {
    const val = +event.target.value;
    if (val != autoClickCalcDamageDisplayMode && [0, 1].includes(val)) {
        autoClickCalcDamageDisplayMode = val;
        localStorage.setItem('autoClickCalcDamageDisplayMode', autoClickCalcDamageDisplayMode);
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
            autoClickCalcTracker.ticks[0]++;
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
        if (DungeonRunner.fighting() || DungeonBattle.catching()) {
            return;
        }
        // Scan each new dungeon floor
        if (autoDungeonTracker.ID !== DungeonRunner.dungeonID || autoDungeonTracker.floor !== DungeonRunner.map.playerPosition().floor) {
            scanDungeon();
        }
        // Reset pathfinding coordinates to entrance
        if (autoDungeonTracker.coords == null) {
            autoDungeonTracker.coords = new Point(Math.floor(autoDungeonTracker.floorSize / 2), autoDungeonTracker.floorSize - 1, autoDungeonTracker.floor);
        }
        const floorMap = DungeonRunner.map.board()[autoDungeonTracker.floor];

        // All targets visible, fight enemies / open chests then finish floor
        if (floorMap[autoDungeonTracker.bossCoords.y][autoDungeonTracker.bossCoords.x].isVisible &&
            !((autoDungeonChestMode || autoDungeonEncounterMode) && !autoDungeonTracker.floorExplored)) {
            clearDungeon();
        }
        // Explore dungeon to reveal boss + any target tiles
        else {
            exploreDungeon();
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
function scanDungeon() {
    // Reset / update tracker values
    autoDungeonTracker.ID = DungeonRunner.dungeonID;
    autoDungeonTracker.floor = DungeonRunner.map.playerPosition().floor;
    autoDungeonTracker.floorSize = DungeonRunner.map.floorSizes[DungeonRunner.map.playerPosition().floor];
    autoDungeonTracker.encounterCoords = [];
    autoDungeonTracker.chestCoords = [];
    autoDungeonTracker.coords = null;
    autoDungeonTracker.targetCoords = null;
    autoDungeonTracker.floorExplored = false;
    autoDungeonTracker.floorFinished = false;

    // Scan for chest and boss coordinates
    var dungeonBoard = DungeonRunner.map.board()[autoDungeonTracker.floor];
    for (var y = 0; y < dungeonBoard.length; y++) {
        for (var x = 0; x < dungeonBoard[y].length; x++) {
            let tile = dungeonBoard[y][x];
            if (tile.type() == GameConstants.DungeonTile.enemy) {
                autoDungeonTracker.encounterCoords.push(new Point(x, y, autoDungeonTracker.floor));
            } else if (tile.type() == GameConstants.DungeonTile.chest) {
                let lootTier = Object.keys(baseLootTierChance).indexOf(tile.metadata.tier);
                autoDungeonTracker.chestCoords.push({'xy': new Point(x, y, autoDungeonTracker.floor), 'tier': lootTier});
            } else if (tile.type() == GameConstants.DungeonTile.boss || tile.type() == GameConstants.DungeonTile.ladder) {
                autoDungeonTracker.bossCoords = new Point(x, y, autoDungeonTracker.floor);
            }
        }
    }
    // Sort chests by descending rarity
    autoDungeonTracker.chestCoords.sort((a, b) => b.tier - a.tier);

    // TODO find a more future-proof way to get flash distance
    autoDungeonTracker.flashTier = DungeonFlash.tiers.findIndex(tier => tier === DungeonRunner.map.flash);
    autoDungeonTracker.flashCols = [];
    let flashRadius = DungeonRunner.map.flash?.playerOffset[0] ?? 0;
    // Calculate minimum columns to fully reveal dungeon with Flash
    if (flashRadius > 0) {
        let cols = new Set();
        cols.add(flashRadius);
        let i = autoDungeonTracker.floorSize - flashRadius - 1;
        while (i > flashRadius) {
            cols.add(i);
            i -= flashRadius * 2 + 1;
        }
        autoDungeonTracker.flashCols = [...cols].sort();
    }
}

/**
 * Explores dungeon to reveal tiles, skipping columns that can be efficiently revealed by Flash
 */
function exploreDungeon() {
    const dungeonBoard = DungeonRunner.map.board()[autoDungeonTracker.floor];
    var hasMoved = false;
    while (!hasMoved) {
        // End of column, move to start of new column
        if (autoDungeonTracker.coords.y == 0) {
            autoDungeonTracker.coords.y = autoDungeonTracker.floorSize - 1;
            if (autoDungeonTracker.coords.x >= autoDungeonTracker.floorSize - 1 || autoDungeonTracker.coords.x === autoDungeonTracker.flashCols.at(-1)) {
                // Done with this side, move to other side of the entrance
                autoDungeonTracker.coords.x = Math.floor(autoDungeonTracker.floorSize / 2) - 1;
            } else if (autoDungeonTracker.coords.x == 0 || autoDungeonTracker.coords.x === autoDungeonTracker.flashCols[0]) {
                // Done exploring, clearDungeon() will take over from here
                autoDungeonTracker.floorExplored = true;
                return;
            } else {
                // Move away from the entrance
                autoDungeonTracker.coords.x += (autoDungeonTracker.coords.x >= Math.floor(autoDungeonTracker.floorSize / 2) ? 1 : -1);
            }
        // Dungeon has Flash unlocked, skip columns not in optimal flash pathing
        } else if (autoDungeonTracker.flashTier > -1
            && autoDungeonTracker.coords.y == (autoDungeonTracker.floorSize - 1)
            && !autoDungeonTracker.flashCols.includes(autoDungeonTracker.coords.x)) {
            // Move one column further from the entrance
            autoDungeonTracker.coords.x += (autoDungeonTracker.coords.x >= Math.floor(autoDungeonTracker.floorSize / 2) ? 1 : -1);
        }
        // Move through current column
        else {
            autoDungeonTracker.coords.y -= 1;
        }
        // One move per tick to look more natural
        if (!dungeonBoard[autoDungeonTracker.coords.y][autoDungeonTracker.coords.x].isVisited) {
            DungeonRunner.map.moveToCoordinates(autoDungeonTracker.coords.x, autoDungeonTracker.coords.y);
            hasMoved = true;
        }
    }
}

/**
 * Clears dungeon, visiting all desired tile types. Assumes dungeon has already been explored to reveal desired tiles.
 */
function clearDungeon() {
    const dungeonBoard = DungeonRunner.map.board()[autoDungeonTracker.floor];
    var hasMoved = false;
    var stuckInLoopCounter = 0;
    while (!hasMoved) {
        // Choose a tile to move towards
        if (!autoDungeonTracker.targetCoords) {
            autoDungeonTracker.targetCoords = chooseDungeonTargetTile();
        }
        autoDungeonTracker.coords = pathfindTowardDungeonTarget();
        if (!autoDungeonTracker.coords) {
            console.warn(`Auto Dungeon could not find path to target tile \'${GameConstants.DungeonTile[dungeonBoard[autoDungeonTracker.targetCoords.y][autoDungeonTracker.targetCoords.x].type()]}\' (${autoDungeonTracker.targetCoords.x}, ${autoDungeonTracker.targetCoords.y})`);
            toggleAutoDungeon();
            return;
        }
        // One move per tick to look more natural
        if (!(dungeonBoard[autoDungeonTracker.coords.y][autoDungeonTracker.coords.x] === DungeonRunner.map.currentTile())) {
            DungeonRunner.map.moveToCoordinates(autoDungeonTracker.coords.x, autoDungeonTracker.coords.y);
            hasMoved = true;
        }
        // Target tile reached
        if (autoDungeonTracker.coords.x === autoDungeonTracker.targetCoords.x && autoDungeonTracker.coords.y === autoDungeonTracker.targetCoords.y) {
            autoDungeonTracker.targetCoords = null;
            hasMoved = true;
            // Take corresponding action
            const tileType = DungeonRunner.map.currentTile().type();
            if (tileType === GameConstants.DungeonTile.enemy) {
                // Do nothing, fights begin automatically
            } else if (tileType === GameConstants.DungeonTile.chest) {
                DungeonRunner.openChest();
            } else if (tileType === GameConstants.DungeonTile.boss) {
                if (autoDungeonTracker.floorFinished) {
                    DungeonRunner.startBossFight();
                }
            } else if (tileType === GameConstants.DungeonTile.ladder) {
                if (autoDungeonTracker.floorFinished) {
                    DungeonRunner.nextFloor();
                }
            } else {
                console.warn(`Auto Dungeon targeted tile type ${GameConstants.DungeonTile[tileType]}`);
            }
        }
        stuckInLoopCounter++;
        if (stuckInLoopCounter > 5) {
            console.warn(`Auto Dungeon got stuck in a loop while moving to tile \'${GameConstants.DungeonTile[dungeonBoard[autoDungeonTracker.targetCoords.y][autoDungeonTracker.targetCoords.x].type()]}\' (${autoDungeonTracker.targetCoords.x}, ${autoDungeonTracker.targetCoords.y})`);
            toggleAutoDungeon();
            return;
        }
    }
}

function chooseDungeonTargetTile() {
    const dungeonBoard = DungeonRunner.map.board()[autoDungeonTracker.floor];
    let target = null;
    while (!target) {
        // Boss tile not yet unlocked
        if (!dungeonBoard[autoDungeonTracker.bossCoords.y][autoDungeonTracker.bossCoords.x].isVisited) {
            target = autoDungeonTracker.bossCoords;
        }
        // Encounters to fight
        else if (autoDungeonEncounterMode && autoDungeonTracker.encounterCoords.length) {
            // Skip already-fought encounters
            let encounter = autoDungeonTracker.encounterCoords.pop();
            if (dungeonBoard[encounter.y][encounter.x].type() == GameConstants.DungeonTile.enemy) {
                target = encounter;
            } else {
                continue;
            }
        }
        // Chests to open
        else if (autoDungeonChestMode && autoDungeonTracker.chestCoords.length && autoDungeonTracker.chestCoords[0].tier >= autoDungeonLootTier) {
            target = autoDungeonTracker.chestCoords.shift().xy;
        }
        // Open visible chests of sufficient rarity
        else if (autoDungeonAlwaysOpenRareChests && autoDungeonTracker.chestCoords.some((c) => c.tier >= autoDungeonLootTier && dungeonBoard[c.xy.y][c.xy.x].isVisible)) {
            let index = autoDungeonTracker.chestCoords.findIndex((c) => c.tier >= autoDungeonLootTier && dungeonBoard[c.xy.y][c.xy.x].isVisible);
            target = autoDungeonTracker.chestCoords[index].xy;
            autoDungeonTracker.chestCoords.splice(index, 1);
        }
        // Time to fight the boss
        else {
            target = autoDungeonTracker.bossCoords;
            autoDungeonTracker.floorFinished = true;
        }
    }
    return target;
}

/** 
 * Find next tile on the shortest path towards target via breadth-first search
 */
function pathfindTowardDungeonTarget() {
    const target = autoDungeonTracker.targetCoords;
    let result = null;
    if (!target) {
        return result;
    }
    const queue = [target];
    const visited = new Set(`${target.x}-${target.y}`);
    while (queue.length) {
        const p = queue.shift();
        if (DungeonRunner.map.hasAccessToTile(p)) {
            result = p;
            break;
        }
        const adjTiles = [[p.x - 1, p.y], [p.x + 1, p.y], [p.x, p.y - 1], [p.x, p.y + 1]];
        for (let [nx, ny] of adjTiles) {
            // Enqueue valid tiles not yet considered
            let xy = `${nx}-${ny}`;
            if (0 <= nx && nx < autoDungeonTracker.floorSize && 0 <= ny && ny < autoDungeonTracker.floorSize && !visited.has(xy)) {
                queue.push(new Point(nx, ny, target.floor));
                visited.add(xy);
            }
        }
    }
    return result;
}

/**
 * Override DungeonRunner built-in functions*:
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
    clearInterval(autoClickCalcLoop);
    resetCalculator();
    if (autoClickState()) {
        autoClickCalcLoop = setInterval(function () {
            if (!hasPlayerMoved()) {
                var elem;
                var clickDamage = App.game.party.calculateClickAttack(true);
                var actualElapsed = (Date.now() - autoClickCalcTracker.lastUpdate.at(-1)) / (1000 * autoClickCalcTracker.lastUpdate.length);


                // Percentage of maximum ticksPerSecond
                elem = document.getElementById('tick-efficiency');
                var avgTicks = autoClickCalcTracker.ticks.reduce((a, b) => a + b, 0) / autoClickCalcTracker.ticks.length;
                avgTicks = avgTicks / actualElapsed;
                if (autoClickCalcEfficiencyDisplayMode == 1) {
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
                var avgClicks = (App.game.statistics.clickAttacks() - autoClickCalcTracker.clicks.at(-1)) / autoClickCalcTracker.clicks.length;
                avgClicks = avgClicks / actualElapsed;
                if (autoClickCalcDamageDisplayMode == 1) {
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
                if (autoClickCalcTracker.areaHealth == 0) {
                    // can't meaningfully calculate a value for this area/game state
                    elem.innerHTML = '-';
                    elem.style.removeProperty('color');
                } else if (autoClickCalcDamageDisplayMode == 1) {
                    // display damage mode
                    var reqDamage = autoClickCalcTracker.areaHealth;
                    elem.innerHTML = reqDamage.toLocaleString('en-US');
                    elem.style.color = (clickDamage * autoClickMultiplier >= reqDamage ? 'greenyellow' : 'darkred');
                } else {
                    // display clicks mode
                    var reqClicks = Math.max((autoClickCalcTracker.areaHealth / clickDamage), 1);
                    reqClicks = Math.ceil(reqClicks * 10) / 10; // round up to one decimal point
                    elem.innerHTML = reqClicks.toLocaleString('en-US', {maximumFractionDigits: 1});
                    elem.style.color = (reqClicks <= autoClickMultiplier ? 'greenyellow' : 'darkred');
                }

                // Enemies per second
                elem = document.getElementById('enemies-per-second');
                var avgEnemies = (App.game.statistics.totalPokemonDefeated() - autoClickCalcTracker.enemies.at(-1)) / autoClickCalcTracker.enemies.length;
                avgEnemies = avgEnemies / actualElapsed;
                elem.innerHTML = avgEnemies.toLocaleString('en-US', {maximumFractionDigits: 1});
                elem.style.color = 'gold';

                // Make room for next second's stats tracking
                // Add new entries to start of array for easier incrementing
                autoClickCalcTracker.ticks.unshift(0);
                if (autoClickCalcTracker.ticks.length > 10) {
                    autoClickCalcTracker.ticks.pop();
                }
                autoClickCalcTracker.clicks.unshift(App.game.statistics.clickAttacks());
                if (autoClickCalcTracker.clicks.length > 10) {
                    autoClickCalcTracker.clicks.pop();
                }
                autoClickCalcTracker.enemies.unshift(App.game.statistics.totalPokemonDefeated());
                if (autoClickCalcTracker.enemies.length > 10) {
                    autoClickCalcTracker.enemies.pop();
                }
                autoClickCalcTracker.lastUpdate.unshift(Date.now());
                if (autoClickCalcTracker.lastUpdate.length > 10) {
                    autoClickCalcTracker.lastUpdate.pop();
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
    autoClickCalcTracker.lastUpdate = [Date.now()];
    autoClickCalcTracker.ticks = [0];
    autoClickCalcTracker.clicks = [App.game.statistics.clickAttacks()];
    autoClickCalcTracker.enemies = [App.game.statistics.totalPokemonDefeated()];
    playerTown = player.town().name;
    playerRoute = player.route();
    calculateAreaHealth();
    document.getElementById('auto-click-info').innerHTML = `<div>${autoClickCalcEfficiencyDisplayMode == 0 ? 'Clicker Efficiency' : 'Ticks/s'}:<br><div id="tick-efficiency" style="font-weight:bold;">-</div></div>
        <div>${autoClickCalcDamageDisplayMode == 0 ? 'Click Attacks/s' : 'DPS'}:<br><div id="clicks-per-second" style="font-weight:bold;">-</div></div>
        <div>Req. ${autoClickCalcDamageDisplayMode == 0 ? 'Clicks' : 'Click Damage'}:<br><div id="req-clicks" style="font-weight:bold;">-</div></div>
        <div>Enemies/s:<br><div id="enemies-per-second" style="font-weight:bold;">-</div></div>`;
}


/**
 * Check whether player state or location has changed
 */
function hasPlayerMoved() {
    var moved = false;
    if (autoClickCalcTracker.playerState != App.game.gameState) {
        autoClickCalcTracker.playerState = App.game.gameState;
        moved = true;
    }
    if (autoClickCalcTracker.playerState === GameConstants.GameState.gym) {
        if (autoClickCalcTracker.playerLocation != GymRunner.gymObservable().leaderName) {
            moved = true;
        }
        autoClickCalcTracker.playerLocation = GymRunner.gymObservable().leaderName;
    } else if (autoClickCalcTracker.playerState === GameConstants.GameState.dungeon) {
        if (autoClickCalcTracker.playerLocation != DungeonRunner.dungeon.name) {
            moved = true;
        }
        autoClickCalcTracker.playerLocation = DungeonRunner.dungeon.name;
    } else if (autoClickCalcTracker.playerState === GameConstants.GameState.temporaryBattle) {
        if (autoClickCalcTracker.playerLocation != TemporaryBattleRunner.battleObservable().name) {
            moved = true;
        }
        autoClickCalcTracker.playerLocation = TemporaryBattleRunner.battleObservable().name;
    } else {
        // Conveniently, player.route() = 0 when not on a route
        if (autoClickCalcTracker.playerLocation != (player.route() || player.town().name)) {
            moved = true;
        }
        autoClickCalcTracker.playerLocation = player.route() || player.town().name;
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
        autoClickCalcTracker.areaHealth = PokemonFactory.routeHealth(player.route(), player.region);
        // Adjust for route health variation (adapted from PokemonFactory.generateWildPokemon)
        const pokeHP = [...new Set(Object.values(Routes.getRoute(player.region, player.route()).pokemon).flat().flatMap(p => p.pokemon ?? p))].map(p => pokemonMap[p].base.hitpoints);
        const averageHP = pokeHP.reduce((s, a) => s + a, 0) / pokeHP.length;
        const highestHP = pokeHP.reduce((m, a) => Math.max(m, a), 0);
        autoClickCalcTracker.areaHealth = Math.round(autoClickCalcTracker.areaHealth * (0.9 + (highestHP / averageHP) / 10));
    } else if (App.game.gameState === GameConstants.GameState.gym) {
        // Get highest health gym pokemon
        autoClickCalcTracker.areaHealth = GymRunner.gymObservable().getPokemonList().reduce((a, b) => Math.max(a, b.maxHealth), 0);
    } else if (App.game.gameState === GameConstants.GameState.dungeon) {
        autoClickCalcTracker.areaHealth = DungeonRunner.dungeon.baseHealth;
    } else if (App.game.gameState === GameConstants.GameState.temporaryBattle) {
        // Get highest health trainer pokemon
        autoClickCalcTracker.areaHealth = TemporaryBattleRunner.battleObservable().getPokemonList().reduce((a, b) => Math.max(a, b.maxHealth), 0);
    } else {
        autoClickCalcTracker.areaHealth = 0;
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
            elem.after(new Comment("/ko"));
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
autoDungeonEncounterMode = validateStorage('autoDungeonEncounterMode', 'boolean') ?? false;
autoDungeonChestMode = validateStorage('autoDungeonEncounterMode', 'boolean') ?? false;
autoDungeonAlwaysOpenRareChests = validateStorage('autoDungeonAlwaysOpenRareChests', 'boolean') ?? false;
autoDungeonLootTier = validateStorage('autoDungeonLootTier', 'number') ?? -1;
if(![-1, ...Object.keys(baseLootTierChance).keys()].includes(autoDungeonLootTier)) {
    autoDungeonLootTier = -1;
}

// Stats calculator
autoClickCalcEfficiencyDisplayMode = validateStorage('autoClickCalcEfficiencyDisplayMode', 'number') ?? 0;
if (![0, 1].includes(autoClickCalcEfficiencyDisplayMode)) {
    autoClickCalcEfficiencyDisplayMode = 0;
}
autoClickCalcDamageDisplayMode = validateStorage('autoClickCalcDamageDisplayMode', 'number') ?? 0;
if (![0, 1].includes(autoClickCalcDamageDisplayMode)) {
    autoClickCalcDamageDisplayMode = 0;
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
