// ==UserScript==
// @name          [Pokeclicker] Enhanced Auto Clicker
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Original/Credit: Ivan Lay, Novie53, andrew951, Kaias26, kevingrillet)
// @description   Clicks through battles appropriately depending on the game state. Also, includes a toggle button to turn Auto Clicking on or off and various insightful statistics. Now also includes an automatic Gym battler as well as Auto Dungeon with different modes, as well as being able to adjust the speed at which the Auto CLicker can click at.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       2.8

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautoclicker.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautoclicker.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var clickState;
var awaitAutoClick;
var autoClickerLoop;
var autoClickDPS;
var clickDPS;
var reqDPS;
var enemySpeedRaw;
var enemySpeed;
var allSelectedGym = 0;
var gymState;
var gymSelect;
var dungeonState;
var dungeonSelect;
var foundBoss = false;
var foundBossX;
var foundBossY;
var delayAutoClick;
window.testDPS = 0;
window.defeatDPS = 0;

function initAutoClicker() {
    const battleView = document.getElementsByClassName('battle-view')[0];

    var elemAC = document.createElement("table");
    elemAC.innerHTML = `<tbody><tr><td colspan="4">
    <button id="auto-click-start" class="btn btn-${clickState ? 'success' : 'danger'} btn-block" style="font-size:8pt;">
    Auto Click [${clickState ? 'ON' : 'OFF'}]<br>
    <div id="auto-click-info">
    <div id="click-DPS">Auto Click DPS:<br><div style="font-weight:bold;color:gold;">${clickDPS.toLocaleString('en-US')}</div></div>
    <div id="req-DPS">Req. DPS:<br><div style="font-weight:bold;">0</div></div>
    <div id="enemy-DPS">Enemy/s:<br><div style="font-weight:bold;color:black;">0</div></div>
    </div>
    </button>
    <div id="click-delay-cont">
    <div id="auto-click-delay-info">Click Attack Delay: ${clickDelayFixed(1000 / delayAutoClick)}/s</div>
    <input type="range" min="1" max="50" value="${delayAutoClick}" id="auto-click-delay">
    </div>
    </td></tr>
    <tr>
    <td style="width: 42%;">
    <button id="auto-dungeon-start" class="btn btn-block btn-${dungeonState ? 'success' : 'danger'}" style="font-size: 8pt;">
    Auto Dungeon [${dungeonState ? 'ON' : 'OFF'}]</button>
    </td>
    <td>
  <select id="dungeon-select">
    <option value="0">F</option>
    <option value="1">B</option>
  </select>
    </td>
    <td style="width: 40%;">
    <button id="auto-gym-start" class="btn btn-block btn-${gymState ? 'success' : 'danger'}" style="font-size: 8pt;">
    Auto Gym [${gymState ? 'ON' : 'OFF'}]
    </button>
    </td>
    <td>
  <select id="gym-select">
    <option value="0">#1</option>
    <option value="1">#2</option>
    <option value="2">#3</option>
    <option value="3">#4</option>
    <option value="4">#5</option>
    <option value="5">All</option>
  </select>
    </td>
    </tr>
    </tbody>`
    battleView.before(elemAC)
    document.getElementById('gym-select').value = gymSelect;
    document.getElementById('dungeon-select').value = dungeonSelect;

    document.getElementById('auto-click-start').addEventListener('click', () => { toggleAutoClick(); });
    document.getElementById('auto-gym-start').addEventListener('click', event => { toggleAutoGym(event); });
    document.getElementById('auto-dungeon-start').addEventListener('click', event => { toggleAutoDungeon(event); });
    document.getElementById('gym-select').addEventListener('change', event => { changeSelectedGym(event); });
    document.getElementById('dungeon-select').addEventListener('change', event => { changeSelectedDungeon(event); });
    document.getElementById('auto-click-delay').addEventListener('change', event => { changeClickDelay(event); });

    addGlobalStyle('#auto-click-info { display: flex;flex-direction: row;justify-content: center; }');
    addGlobalStyle('#auto-click-info > div { width: 33.3%; }');
    addGlobalStyle('#dungeonMap { padding-bottom: 9.513%; }');
    addGlobalStyle('#click-delay-cont { display: flex; flex-direction: column; align-items: stretch;}')

    if (clickState) {
        autoClicker();
        calcClickDPS();
    }
    overideClickAttack();
}

function toggleAutoClick() {
    const element = document.getElementById('auto-click-start');
    clickState = !clickState;
    clickState ? autoClicker() : clearInterval(autoClickerLoop);
    clickState ? calcClickDPS() : clearInterval(autoClickDPS);
    if (clickState) {
        clickDPS = JSON.parse(localStorage.getItem('storedClickDPS'));
    } else {
        clickDPS = 0;
        reqDPS = 0;
        enemySpeedRaw = 0;
    }
    clickState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.innerHTML = `Auto Click [${clickState ? 'ON' : 'OFF'}]<br>
    <div id="auto-click-info">
    <div id="click-DPS">Auto Click DPS:<br><div style="font-weight:bold;color:gold;">${clickDPS.toLocaleString('en-US')}</div></div>
    <div id="req-DPS">Req. DPS:<br><div style="font-weight:bold;">0</div></div>
    <div id="enemy-DPS">Enemy/s:<br><div style="font-weight:bold;color:black;">0</div></div>
    </div>`
    localStorage.setItem('autoClickState', clickState);
}

function toggleAutoGym(event) {
    const element = event.target;
    gymState = !gymState;
    gymState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Auto Gym [${gymState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('autoGymState', gymState);
}

function toggleAutoDungeon(event) {
    const element = event.target;
    dungeonState = !dungeonState;
    dungeonState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Auto Dungeon [${dungeonState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('autoDungeonState', dungeonState);
}

function changeSelectedGym(event) {
    const element = event.target;
    if (gymSelect != +element.value) {
        gymSelect = +element.value;
        localStorage.setItem("selectedGym", gymSelect);
    }
}

function changeSelectedDungeon(event) {
    const element = event.target;
    if (dungeonSelect != +element.value) {
        dungeonSelect = +element.value;
        localStorage.setItem("selectedDungeon", dungeonSelect);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function calcClickDPS() {
    autoClickDPS = setInterval(function () {
        const clickSec = window.testDPS;
        let enemyHealth;
        try {
            enemyHealth = Battle.enemyPokemon().maxHealth();
        }
        catch (err) {
            enemyHealth = 0;
        }
        if (clickDPS != App.game.party.calculateClickAttack() * clickSec) {
            clickDPS = App.game.party.calculateClickAttack() * clickSec;
            document.getElementById('click-DPS').innerHTML = `Auto Click DPS:<br><div style="font-weight:bold;color:gold;">${Math.floor(clickDPS).toLocaleString('en-US')}</div>`
            localStorage.setItem('storedClickDPS', clickDPS)
        }
        if (reqDPS != enemyHealth * clickSec) {
            reqDPS = enemyHealth * clickSec;
            document.getElementById('req-DPS').innerHTML = `Req. DPS:<br><div style="font-weight:bold;color: ${clickDPS >= reqDPS ? 'greenyellow' : 'darkred'}">${Math.ceil(reqDPS).toLocaleString('en-US')}</div>`
        }
        if (enemySpeedRaw != ((App.game.party.calculateClickAttack() * clickSec) / enemyHealth).toFixed(1)) {
            enemySpeed = ((App.game.party.calculateClickAttack() * clickSec) / enemyHealth);
            enemySpeedRaw = enemySpeed;
            if (isNaN(enemySpeedRaw) || enemySpeedRaw == 'Infinity' || Battle.catching()) {
                enemySpeed = 0;
            }
            if (enemySpeedRaw >= clickSec && enemySpeedRaw != 'Infinity' && !Battle.catching()) {
                enemySpeed = window.defeatDPS;
            }
            if (!Number.isInteger(enemySpeed) && enemySpeed != 0) { enemySpeed = enemySpeed.toFixed(1).toString().replace('.0', '') }
            document.getElementById('enemy-DPS').innerHTML = `Enemy/s:<br><div style="font-weight:bold;color:black;">${enemySpeed}</div>`
        }
        window.testDPS = 0;
        window.defeatDPS = 0;
    }, 1000);
}

function autoClicker() {
    autoClickerLoop = setInterval(function () {
        // Click while in a normal battle
        if (App.game.gameState == GameConstants.GameState.fighting) {
            Battle.clickAttack();
        }

        //Auto Gym checking
        if (gymState) {
            autoGym();
        }

        //Auto Dungeon checking
        if (dungeonState && DungeonRunner.fighting() == false && DungeonBattle.catching() == false) {
            autoDungeon();
        }
        //Reset the values for the boss coordinates if we timeout or turn off autoDungeon
        if ((!dungeonState && foundBoss) || (dungeonState && DungeonRunner.dungeonFinished() && foundBoss)) {
            foundBoss = false
            bossCoords.length = 0
        }

        // Click while in a gym battle
        if (App.game.gameState === GameConstants.GameState.gym) {
            GymBattle.clickAttack();
        }

        // Click while in "Tomporary Battle" (battle ultra wormhole)
        if (App.game.gameState === GameConstants.GameState.temporaryBattle) {
            TemporaryBattleBattle.clickAttack();
        }

        // Click while in a dungeon - will also interact with non-battle tiles (e.g. chests)
        if (App.game.gameState === GameConstants.GameState.dungeon) {
            if (DungeonRunner.fighting() && !DungeonBattle.catching()) {
                DungeonBattle.clickAttack();
            }
        }
    }, delayAutoClick); // The app hard-caps click attacks at 50
}

function changeClickDelay(event) {
    const delay = +event.target.value;
    delayAutoClick = delay;
    localStorage.setItem("delayAutoClick", delay);
    overideClickAttack();
    if (clickState) {
        clearInterval(autoClickerLoop);
        autoClicker();
    }
    let clickSec = (1000 / delayAutoClick);
    document.getElementById('auto-click-delay-info').innerText = `Click Attack Delay: ${clickDelayFixed(clickSec)}/s`;
}

function clickDelayFixed(int) {
    if (int != parseInt(int)) { int = int.toFixed(2) }
    return int;
}

function overideClickAttack() {
    // Overiding the game's function for Click Attack
    Battle.clickAttack = function () {
        // click attacks disabled and we already beat the starter
        if (App.game.challenges.list.disableClickAttack.active() && player.starter() != GameConstants.Starter.None) {
            return;
        }
        // TODO: figure out a better way of handling this
        // Limit click attack speed, Only allow 1 attack per 50ms (20 per second)
        const now = Date.now();
        if (this.lastClickAttack > now - delayAutoClick) {
            return;
        }
        this.lastClickAttack = now;
        if (!this.enemyPokemon()?.isAlive()) {
            return;
        }
        GameHelper.incrementObservable(App.game.statistics.clickAttacks);
        this.enemyPokemon().damage(App.game.party.calculateClickAttack(true));
        window.testDPS++;
        if (!this.enemyPokemon().isAlive()) {
            this.defeatPokemon();
            window.defeatDPS++;
        }
    }
}

function autoGym() {
    //Checking if Gyms exist here and grabbing them
    const getGyms = player.town().content.filter((c) => ['Gym'].includes(c.constructor.name));
    if (getGyms.length != 0) {
        const townName = player.town().name;
        if (!MapHelper.isTownCurrentLocation(townName)) {
            MapHelper.moveToTown(townName)
        }
        /*Don't think this can ever happen
            if (player.region != player.town().region) {
                player.region = player.town().region
            }*/

        if (App.game.gameState != GameConstants.GameState.gym) {
            //Checking if Champion exists here and grabbing them
            const getChamp = player.town().content.filter((c) => ['Champion'].includes(c.constructor.name));
            const gymChampLen = (getGyms.length + getChamp.length) - 1;
            //Checking if Champion is unlocked
            let champUnlocked;
            try { champUnlocked = getChamp[0].isUnlocked() } catch (err) { champUnlocked = false };
            //If "All" is selected we attempt to fight and loop through all Gyms, including the Champion if available and unlocked
            if (gymSelect === 5) {
                //Reset if exceeded
                if (allSelectedGym === 5 || allSelectedGym > gymChampLen) {
                    allSelectedGym = 0;
                }
                if (champUnlocked && allSelectedGym === gymChampLen) {
                    //We fight the Champion if Champion exists and is unlocked
                    GymRunner.startGym(getChamp[0]);
                } else if (getGyms[allSelectedGym].isUnlocked()) {
                    //We fight Gyms instead if they're unlocked
                    GymRunner.startGym(getGyms[allSelectedGym]);
                }
                allSelectedGym++;
            } else {
                //Making sure we don't fight Gyms that don't exist and fight the lowest if we pick higher
                const selGym = Math.min(gymSelect, gymChampLen);
                //#5 is purely for the Champion and typically E4 where there's 5 total
                //Whatever value is selected, if it's above the # of gyms, we fight a champion if available 
                if (gymSelect >= gymChampLen && champUnlocked) {
                    GymRunner.startGym(getChamp[0]);
                } else if (getGyms[selGym].isUnlocked()) {
                    //Fighting the selected Gym here
                    GymRunner.startGym(getGyms[selGym])
                }
            }
        }
    }
}

var bossCoords = []

function autoDungeon() {
    //Rewrite
    if (player.town().hasOwnProperty("dungeon") == true && player.town().dungeon !== undefined) {
        var getTokens = App.game.wallet.currencies[GameConstants.Currency.dungeonToken]();
        var dungeonCost = player.town().dungeon.tokenCost;
        const townName = player.town().name;
        if (!MapHelper.isTownCurrentLocation(townName)) {
            MapHelper.moveToTown(townName)
        }
        //Don't think this condition is ever possible
        /*if (player.region != player.town().region) {
            player.region = player.town().region
        }*/
        if (getTokens >= dungeonCost && App.game.gameState != GameConstants.GameState.dungeon) {
            DungeonRunner.initializeDungeon(player.town().dungeon)
        }

        if (App.game.gameState === GameConstants.GameState.dungeon) {
            var dungeonBoard = DungeonRunner.map.board()[DungeonRunner.map.playerPosition().floor];
            //The boss can be found at any time
            if (foundBoss == false) {
                bossCoords = scan(dungeonBoard)
            }
            //Wander around until we can move to the boss tile
            //Pathfinding should be implemented here, A* looks like the best algorithm
            else if (foundBoss == true && dungeonSelect == 1) {
                wander(dungeonBoard, bossCoords)
            }
            else if (dungeonSelect == 0) {
                fullClear(dungeonBoard, bossCoords)
            }
        }
    }
}

function scan(dungeonBoard) {
    /*var bossCoords = []
    var playerCoords = []*/
    for (var i = 0; i < dungeonBoard.length; i++) {
        for (var j = 0; j < dungeonBoard[i].length; j++) {
            if (dungeonBoard[i][j].type() == GameConstants.DungeonTile.boss || dungeonBoard[i][j].type() == GameConstants.DungeonTile.ladder) {
                foundBoss = true
                return [i, j]
            }
            //Required for pathfinding, if ever implemented
            /*if (dungeonBoard[i][j].hasPlayer == true){
                playerCoords = [i, j]
            }*/
        }
    }
}

function wander(dungeonBoard, bossCoords) {
    var moves = []
    //Attempt to move to the boss if the coordinates are within movable range
    DungeonRunner.map.moveToCoordinates(bossCoords[1], bossCoords[0])
    if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.boss) {
        foundBoss = false
        bossCoords.length = 0
        DungeonRunner.startBossFight()
    }
    if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.ladder) {
        foundBoss = false
        bossCoords.length = 0
        DungeonRunner.nextFloor()
    }
    //Iterates through the board and compiles all possible moves
    for (var i = 0; i < dungeonBoard.length; i++) {
        for (var j = 0; j < dungeonBoard[i].length; j++) {
            //The entrance doesn't count as visited on first entering a dungeon so this OR is required
            if (dungeonBoard[i][j].isVisited == true || dungeonBoard[i][j].type() == GameConstants.DungeonTile.entrance) {
                //This is required because if the column doesn't exist it throws an attribute of undefined error
                if (dungeonBoard[i + 1] != undefined) {
                    if (dungeonBoard[i + 1][j] != undefined) {
                        if (dungeonBoard[i + 1][j].isVisited == false) moves.push([i + 1, j])
                    }
                }
                if (dungeonBoard[i - 1] != undefined) {
                    if (dungeonBoard[i - 1][j] != undefined) {
                        if (dungeonBoard[i - 1][j].isVisited == false) moves.push([i - 1, j])
                    }
                }
                if (dungeonBoard[i][j + 1] != undefined) {
                    if (dungeonBoard[i][j + 1].isVisited == false) moves.push([i, j + 1])
                }
                if (dungeonBoard[i][j - 1] != undefined) {
                    if (dungeonBoard[i][j - 1].isVisited == false) moves.push([i, j - 1])
                }
            }
        }
    }
    //Select a random move from compiled list of possible ones
    var moveTo = moves[getRandomInt(moves.length)]
    //Coordinates saved in couples of [y, x] so we swap them when we want to move
    DungeonRunner.map.moveToCoordinates(moveTo[1], moveTo[0])
    //Reset moves array
    moves.length = 0
}

function fullClear(dungeonBoard, bossCoords) {
    //Get number of invisible tiles, if 0 we have the map
    const invisTile = document.getElementById('dungeonMap').querySelectorAll('.tile-invisible').length;
    //Chests
    const getChests = document.getElementById('dungeonMap').querySelectorAll('.tile-chest').length;
    //Enemies
    const getEnemy = document.getElementById('dungeonMap').querySelectorAll('.tile-enemy').length;

    for (var i = 0; i < dungeonBoard.length; i++) {
        for (var j = 0; j < dungeonBoard[i].length; j++) {
            //Basically just attempts to move to all tiles that aren't cleared
            if (dungeonBoard[i][j].isVisited == false) {
                DungeonRunner.map.moveToCoordinates(j, i);
            }

            if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.chest) {
                DungeonRunner.openChest();
            }
        }
    }
    //If we cleared the entire floor, move to the boss room and start the fight
    if (invisTile == 0 && getChests == 0 && getEnemy == 0 && foundBoss == true) {
        DungeonRunner.map.moveToCoordinates(bossCoords[1], bossCoords[0]);
        foundBoss = false;
        bossCoords.length = 0;

        if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.boss) {
            DungeonRunner.startBossFight();
        } else if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.ladder) {
            DungeonRunner.nextFloor();
        }
    }
}

if (!validParse(localStorage.getItem('autoClickState'))) {
    localStorage.setItem("autoClickState", false);
}
if (!validParse(localStorage.getItem('storedClickDPS'))) {
    localStorage.setItem("storedClickDPS", 0);
}
if (!validParse(localStorage.getItem('autoGymState'))) {
    localStorage.setItem("autoGymState", false);
}
if (!validParse(localStorage.getItem('selectedGym'))) {
    localStorage.setItem("selectedGym", 0);
}
if (!validParse(localStorage.getItem('autoDungeonState'))) {
    localStorage.setItem("autoDungeonState", false);
}
if (!validParse(localStorage.getItem('selectedDungeon'))) {
    localStorage.setItem("selectedDungeon", 0);
}
if (!validParse(localStorage.getItem('delayAutoClick'))) {
    localStorage.setItem("delayAutoClick", 50);
}
clickState = JSON.parse(localStorage.getItem('autoClickState'));
gymState = JSON.parse(localStorage.getItem('autoGymState'));
gymSelect = JSON.parse(localStorage.getItem('selectedGym'));

try {
    dungeonState = JSON.parse(localStorage.getItem('autoDungeonState'));
} catch (error) {
    dungeonState = false
    localStorage.setItem("autoDungeonState", false);
}

dungeonSelect = JSON.parse(localStorage.getItem('selectedDungeon'));
delayAutoClick = JSON.parse(localStorage.getItem('delayAutoClick'));
clickDPS = clickState ? JSON.parse(localStorage.getItem('storedClickDPS')) : 0;

function loadScript() {
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function () {
        var result = oldInit.apply(this, arguments)
        initAutoClicker()
        return result
    }
}

var scriptName = 'enhancedautoclicker'

if (document.getElementById('scriptHandler') != undefined) {
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) != null) {
        if (localStorage.getItem(scriptName) == 'true') {
            loadScript()
        }
    }
    else {
        localStorage.setItem(scriptName, 'true')
        loadScript()
    }
}
else {
    loadScript();
}

function validParse(key) {
    try {
        if (key === null) {
            throw new Error;
        }
        JSON.parse(key);
        return true;
    } catch (e) {
        return false;
    }
}

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}
