// ==UserScript==
// @name        [Pokeclicker] Enhanced Auto Clicker
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.6
// @author      Ephenia (Original/Credit: Ivan Lay, Novie53)
// @description Clicks through battles appropriately depending on the game state. Also, includes a toggle button to turn Auto Clicking on or off and various insightful statistics. Now also includes an automatic Gym battler as well as Auto Dungeon with different modes.
// ==/UserScript==

var clickState;
var clickColor;
var awaitAutoClick;
var autoClickerLoop;
var autoClickDPS;
var clickDPS;
var reqDPS;
var enemySpeedRaw;
var enemySpeed;
var colorDPS;
var gymState;
var gymColor;
var gymSelect;
var dungeonState;
var dungeonColor;
var dungeonSelect;
var foundBoss;
var foundBossX;
var foundBossY;
var newSave;
var trainerCards;
var battleView = document.getElementsByClassName('battle-view')[0];

function initAutoClicker() {
    if (clickState == "OFF") {
        clickColor = "danger"
        clickDPS = 0
    } else {
        clickColor = "success"
        clickDPS = +localStorage.getItem('storedClickDPS');
    }
    if (gymState == "OFF") {
        gymColor = "danger"
    } else {
        gymColor = "success"
    }
    if (dungeonState == "OFF") {
        dungeonColor = "danger"
    } else {
        dungeonColor = "success"
    }

    var elemAC = document.createElement("table");
    elemAC.innerHTML = `<tbody><tr><td colspan="4">
    <button id="auto-click-start" class="btn btn-`+ clickColor + ` btn-block" style="font-size:8pt;">
    Auto Click [`+ clickState + `]<br>
    <div id="auto-click-info">
    <div id="click-DPS">Auto Click DPS:<br><div style="font-weight:bold;color:gold;">`+ clickDPS.toLocaleString('en-US') + `</div></div>
    <div id="req-DPS">Req. DPS:<br><div style="font-weight:bold;">0</div></div>
    <div id="enemy-DPS">Enemy/s:<br><div style="font-weight:bold;color:black;">0</div></div>
    </div>
    </button></td></tr>
    <tr>
    <td style="width: 42%;">
    <button id="auto-dungeon-start" class="btn btn-block btn-`+ dungeonColor + `" style="font-size: 8pt;">
    Auto Dungeon [`+ dungeonState + `]</button>
    </td>
    <td>
  <select id="dungeon-select">
    <option value="0">F</option>
    <option value="1">B</option>
  </select>
    </td>
    <td style="width: 40%;">
    <button id="auto-gym-start" class="btn btn-block btn-`+ gymColor + `" style="font-size: 8pt;">
    Auto Gym [`+ gymState + `]
    </button>
    </td>
    <td>
  <select id="gym-select">
    <option value="0">#1</option>
    <option value="1">#2</option>
    <option value="2">#3</option>
    <option value="3">#4</option>
    <option value="4">#5</option>
  </select>
    </td>
    </tr>
    </tbody>`
    battleView.before(elemAC)
    document.getElementById('gym-select').value = gymSelect;
    document.getElementById('dungeon-select').value = dungeonSelect;

    $("#auto-click-start").click(toggleAutoClick)
    $("#auto-gym-start").click(toggleAutoGym)
    $("#gym-select").change(changeSelectedGym)
    $("#auto-dungeon-start").click(toggleAutoDungeon)
    $("#dungeon-select").change(changeSelectedDungeon)
    addGlobalStyle('#auto-click-info { display: flex;flex-direction: row;justify-content: center; }');
    addGlobalStyle('#auto-click-info > div { width: 33.3%; }');
    addGlobalStyle('#dungeonMap { padding-bottom: 9.513%; }');

    if (clickState == "ON") {
        autoClicker();
        calcClickDPS();
    }
}

function toggleAutoClick() {
    if (clickState == "OFF") {
        clickState = "ON"
        document.getElementById("auto-click-start").classList.remove('btn-danger');
        document.getElementById("auto-click-start").classList.add('btn-success');
        clickDPS = +localStorage.getItem('storedClickDPS');
        autoClicker();
        calcClickDPS();
    } else {
        clickState = "OFF"
        document.getElementById("auto-click-start").classList.remove('btn-success');
        document.getElementById("auto-click-start").classList.add('btn-danger');
        clickDPS = 0;
        reqDPS = 0;
        enemySpeedRaw = 0;
        clearInterval(autoClickerLoop)
        clearInterval(autoClickDPS)
    }
    localStorage.setItem("autoClickState", clickState);
    document.getElementById('auto-click-start').innerHTML = `Auto Click [` + clickState + `]<br>
    <div id="auto-click-info">
    <div id="click-DPS">Auto Click DPS:<br><div style="font-weight:bold;color:gold;">`+ clickDPS.toLocaleString('en-US') + `</div></div>
    <div id="req-DPS">Req. DPS:<br><div style="font-weight:bold;">0</div></div>
    <div id="enemy-DPS">Enemy/s:<br><div style="font-weight:bold;color:black;">0</div></div>
    </div>`
}

function toggleAutoGym() {
    if (gymState == "OFF") {
        gymState = "ON"
        document.getElementById("auto-gym-start").classList.remove('btn-danger');
        document.getElementById("auto-gym-start").classList.add('btn-success');
    } else {
        gymState = "OFF"
        document.getElementById("auto-gym-start").classList.remove('btn-success');
        document.getElementById("auto-gym-start").classList.add('btn-danger');
    }
    localStorage.setItem("autoGymState", gymState);
    document.getElementById('auto-gym-start').innerHTML = `Auto Gym [` + gymState + `]`
}

function toggleAutoDungeon() {
    if (dungeonState == "OFF") {
        dungeonState = "ON"
        document.getElementById("auto-dungeon-start").classList.remove('btn-danger');
        document.getElementById("auto-dungeon-start").classList.add('btn-success');
    } else {
        dungeonState = "OFF"
        document.getElementById("auto-dungeon-start").classList.remove('btn-success');
        document.getElementById("auto-dungeon-start").classList.add('btn-danger');
    }
    localStorage.setItem("autoDungeonState", dungeonState);
    document.getElementById('auto-dungeon-start').innerHTML = `Auto Dungeon [` + dungeonState + `]`
}

function changeSelectedGym() {
    if (gymSelect != +document.getElementById('gym-select').value) {
        gymSelect = +document.getElementById('gym-select').value
        localStorage.setItem("selectedGym", gymSelect);
    }
}

function changeSelectedDungeon() {
    if (dungeonSelect != +document.getElementById('dungeon-select').value) {
        dungeonSelect = +document.getElementById('dungeon-select').value
        localStorage.setItem("selectedDungeon", dungeonSelect);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function calcClickDPS() {
    autoClickDPS = setInterval(function () {
        var enemyHealth;
        try {
            enemyHealth = Battle.enemyPokemon().maxHealth();
        }
        catch (err) {
            enemyHealth = 0;
        }

        if (clickDPS != App.game.party.calculateClickAttack() * 20) {
            clickDPS = App.game.party.calculateClickAttack() * 20;
            document.getElementById('click-DPS').innerHTML = `Auto Click DPS:<br><div style="font-weight:bold;color:gold;">` + clickDPS.toLocaleString('en-US'); +`</div>`
            localStorage.setItem('storedClickDPS', clickDPS)
        }
        if (reqDPS != enemyHealth * 20) {
            reqDPS = enemyHealth * 20;
            if (clickDPS >= reqDPS) {
                colorDPS = "greenyellow"
            } else {
                colorDPS = "darkred"
            }
            document.getElementById('req-DPS').innerHTML = `Req. DPS:<br><div style="font-weight:bold;color:` + colorDPS + `">` + reqDPS.toLocaleString('en-US'); +`</div>`
        }
        if (enemySpeedRaw != ((App.game.party.calculateClickAttack() * 20) / enemyHealth).toFixed(1)) {
            enemySpeed = ((App.game.party.calculateClickAttack() * 20) / enemyHealth).toFixed(1);
            enemySpeedRaw = enemySpeed
            //console.log(enemySpeedRaw)
            if (enemySpeedRaw == 'Infinity') {
                enemySpeed = 0
            }
            if (enemySpeedRaw >= 20 && enemySpeedRaw != 'Infinity') {
                enemySpeed = 20
            }
            document.getElementById('enemy-DPS').innerHTML = `Enemy/s:<br><div style="font-weight:bold;color:black;">` + enemySpeed + `</div>`
        }
    }, 1000);
}

function autoClicker() {
    autoClickerLoop = setInterval(function () {
        // Click while in a normal battle
        if (App.game.gameState == GameConstants.GameState.fighting) {
            Battle.clickAttack();
        }

        //Auto Gym checking
        if (gymState == "ON") {
            autoGym();
        }
        
        //Auto Dungeon checking
        if ((dungeonState == "ON") && (DungeonRunner.fighting() == false && DungeonBattle.catching() == false) == true) {
            autoDungeon();
        }

        // Click while in a gym battle
        if (App.game.gameState === GameConstants.GameState.gym) {
            GymBattle.clickAttack();
        }

        // Click while in a dungeon - will also interact with non-battle tiles (e.g. chests)
        if (App.game.gameState === GameConstants.GameState.dungeon) {
            if (DungeonRunner.fighting() && !DungeonBattle.catching()) {
                DungeonBattle.clickAttack();
            }
        }
    }, 50); // The app hard-caps click attacks at 50
}

function autoGym() {
    if (player.town().hasOwnProperty("gym") || player.town().hasOwnProperty("gymList")) {
        if (player.town().gym != null || player.town().gym !== undefined) {
            if (MapHelper.calculateTownCssClass(player.town().name) != "currentLocation") {
                MapHelper.moveToTown(player.town().name)
            }
            if (player.region != player.town().region) {
                player.region = player.town().region
            }

            if (App.game.gameState != GameConstants.GameState.gym) {
                if (player.town().hasOwnProperty("gymList")) {
                    var selGym;
                    for (var i = 0; i <= gymSelect; i++) {
                        if (Gym.isUnlocked(player.town().gymList[i]) == true) {
                            selGym = i;
                        } else {
                            selGym = (i - 1)
                            i = gymLength;
                        }
                        if (selGym != -1) {
                            GymRunner.startGym(player.town().gymList[i])
                        }
                    }
                } else {
                    if (Gym.isUnlocked(player.town().gym) == true) {
                        GymRunner.startGym(player.town().gym)
                    }
                }
            }
        }
    }
}


function autoDungeon() {
    if (player.town().hasOwnProperty("dungeon") == true && player.town().dungeon !== undefined) {
        var getTokens = App.game.wallet.currencies[GameConstants.Currency.dungeonToken]();
        var dungeonCost = player.town().dungeon.tokenCost;
        if (MapHelper.calculateTownCssClass(player.town().name) != "currentLocation") {
            MapHelper.moveToTown(player.town().name)
        }
        if (player.region != player.town().region) {
            player.region = player.town().region
        }
        if (getTokens >= dungeonCost && App.game.gameState != GameConstants.GameState.dungeon) {
            DungeonRunner.initializeDungeon(player.town().dungeon)
        }
        if (App.game.gameState === GameConstants.GameState.dungeon) {

            var dungeonBoard = DungeonRunner.map.board();
            //One of these fails exactly once when starting a dungeon, giving an attribute of undefined error, doesn't cause any other issues
            try{
                var invisTile = document.getElementById('dungeonMap').querySelectorAll('.tile-invisible').length;
                var getChests = document.getElementById('dungeonMap').querySelectorAll('.tile-chest').length;
                var getEnemy = document.getElementById('dungeonMap').querySelectorAll('.tile-enemy').length;
            } catch (err){}
            //var visitTile = document.querySelectorAll('.tile-visited').length; unused variable
            var lockedTile = 0;
            for (var ii = 0; ii < dungeonBoard.length; ii++) {
                for (var iii = 0; iii < dungeonBoard[ii].length; iii++) {
                    var tilePriority = "NO";
                    if (dungeonBoard[ii][iii].isVisited == false && dungeonBoard[ii][iii].isVisible == true) {
                        if (dungeonSelect == 1 && foundBoss == "YES") {
                            DungeonRunner.map.moveToCoordinates(foundBossX, foundBossY)
                            if (DungeonRunner.map.currentTile().type() != GameConstants.DungeonTile.boss) {
                                DungeonRunner.map.moveToCoordinates(iii, ii)
                            }
                        } else {
                            DungeonRunner.map.moveToCoordinates(iii, ii)
                        }
                        tilePriority = "YES"
                    }
                    if (tilePriority == "NO" && dungeonBoard[ii][iii].isVisible == false) {
                        lockedTile++;
                        tilePriority = "YES"
                    }
                    if ((tilePriority == "NO") && (dungeonSelect == 0) && (lockedTile == 0) && (dungeonBoard[ii][iii].isVisible == true) && (dungeonBoard[ii][iii].hasPlayer == false) && (dungeonBoard[ii][iii].cssClass().includes("tile-empty") == false)) {
                        DungeonRunner.map.moveToCoordinates(iii, ii)
                    }
                    
                    
                    if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.chest) {
                        DungeonRunner.openChest();
                    }
                    if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.boss) {
                        if (dungeonSelect == 1) {
                            foundBoss = null;
                            DungeonRunner.startBossFight();
                        }
                        //Checks for any invisible tiles, makes sure you always full clear instead of fighting the boss if you don't have the map
                        if ((dungeonSelect == 0) && (getChests == 0) && (getEnemy == 0) && (invisTile == 0)) {
                            foundBoss = null;
                            DungeonRunner.startBossFight();
                        }
                    }
                    if (dungeonSelect == 1 && dungeonBoard[ii][iii].cssClass().includes("tile-boss") == true) {
                        foundBoss = "YES"
                        foundBossX = iii
                        foundBossY = ii
                    }
                    if (lockedTile == invisTile && lockedTile != 0) {
                        var playerPos = DungeonRunner.map.playerPosition()
                        var moveOrder = ["left", "right", "up", "down"];
                        var leftRight = [-1, 1, 0, 0];
                        var upDown = [0, 0, -1, 1];
                        var posMoves = [];
                        var clearMoves = [];
                        var posIndex = [];
                        var clearIndex = [];
                        for (var move = 0; move < 4; move++) {
                            try {
                                if (dungeonBoard[playerPos.y + upDown[move]][playerPos.x + leftRight[move]].isVisible == false) {
                                    if (DungeonRunner.map.board()[playerPos.x + leftRight[move]][playerPos.y + upDown[move]] != undefined) {
                                        posMoves.push(moveOrder[move])
                                    }
                                } else {
                                    posMoves.push("null")
                                }
                                if (dungeonBoard[playerPos.y + upDown[move]][playerPos.x + leftRight[move]].isVisible == true) {
                                    if (DungeonRunner.map.board()[playerPos.x + leftRight[move]][playerPos.y + upDown[move]] != undefined) {
                                        clearMoves.push(moveOrder[move])
                                    } else {
                                        clearMoves.push("null")
                                    }
                                }
                            }
                            catch (err) {
                                posMoves.push("null")
                                clearMoves.push("null")
                            }
                        }
                        posMoves.forEach((Moves, Index) => {
                            if (Moves != "null") {
                                posIndex.push(Index)
                            }
                        });
                        clearMoves.forEach((Moves, Index) => {
                            if (Moves != "null") {
                                clearIndex.push(Index)
                            }
                        });
                        var selMove;
                        if (posIndex.length > 0) {
                            selMove = getRandomInt(posIndex.length);
                            selMove = posIndex[selMove];
                        } else {
                            selMove = getRandomInt(clearIndex.length);
                            selMove = clearIndex[selMove];
                        }
                        DungeonRunner.map.moveToCoordinates(playerPos.x + leftRight[selMove], playerPos.y + upDown[selMove])
                    }
                }
            }

        }
    }
}

if (localStorage.getItem('autoClickState') == null) {
    localStorage.setItem("autoClickState", "OFF");
}
if (localStorage.getItem('storedClickDPS') == null) {
    localStorage.setItem("storedClickDPS", 0);
}
if (localStorage.getItem('autoGymState') == null) {
    localStorage.setItem("autoGymState", "OFF");
}
if (localStorage.getItem('selectedGym') == null) {
    localStorage.setItem("selectedGym", 0);
}
if (localStorage.getItem('autoDungeonState') == null) {
    localStorage.setItem("autoDungeonState", "OFF");
}
if (localStorage.getItem('selectedDungeon') == null) {
    localStorage.setItem("selectedDungeon", 0);
}
clickState = localStorage.getItem('autoClickState');
gymState = localStorage.getItem('autoGymState');
gymSelect = +localStorage.getItem('selectedGym');
dungeonState = localStorage.getItem('autoDungeonState');
dungeonSelect = localStorage.getItem('selectedDungeon');

function loadScript(){
    var scriptLoad = setInterval(function () {
        try {
            newSave = document.querySelectorAll('label')[0];
            trainerCards = document.querySelectorAll('.trainer-card');
        } catch (err) { }
        if (typeof newSave != 'undefined') {
            for (var i = 0; i < trainerCards.length; i++) {
                trainerCards[i].addEventListener('click', checkAutoClick, false);
            }
            newSave.addEventListener('click', checkAutoClick, false);
            clearInterval(scriptLoad)
        }
    }, 50);
}

var scriptName = 'enhancedautoclicker'

if (document.getElementById('scriptHandler') != undefined){
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) != null){
        if (localStorage.getItem(scriptName) == 'true'){
            loadScript()
        }
    }
    else{
        localStorage.setItem(scriptName, 'true')
        loadScript()
    }
}
else{
    loadScript();
}


function checkAutoClick() {
    awaitAutoClick = setInterval(function () {
        var gameState;
        try {
            gameState = App.game.gameState;
        } catch (err) { }
        if (typeof gameState != 'undefined') {
            initAutoClicker();
            clearInterval(awaitAutoClick)
        }
    }, 1000);
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
