// ==UserScript==
// @name        [Pokeclicker] Enhanced Auto Clicker
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.9
// @author      Ephenia (Original/Credit: Ivan Lay, Novie53, andrew951)
// @description Clicks through battles appropriately depending on the game state. Also, includes a toggle button to turn Auto Clicking on or off and various insightful statistics. Now also includes an automatic Gym battler as well as Auto Dungeon with different modes, as well as being able to adjust the speed at which the Auto CLicker can click at.
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
var allSelectedGym = 0;
var gymState;
var gymColor;
var gymSelect;
var dungeonState;
var dungeonColor;
var dungeonSelect;
var foundBoss = false;
var foundBossX;
var foundBossY;
var newSave;
var delayAutoClick;
var trainerCards;
window.testDPS = 0;
window.defeatDPS = 0;
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
    </button>
    <div id="click-delay-cont">
    <div id="auto-click-delay-info">Click Attack Delay: ` + clickDelayFixed(1000 / delayAutoClick) + `/s</div>
    <input type="range" min="1" max="50" value="` + delayAutoClick + `" id="auto-click-delay">
    </div>
    </td></tr>
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
    <option value="5">All</option>
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
    document.getElementById('auto-click-delay').addEventListener('change', (event) => { changeClickDelay(event) })
    addGlobalStyle('#auto-click-info { display: flex;flex-direction: row;justify-content: center; }');
    addGlobalStyle('#auto-click-info > div { width: 33.3%; }');
    addGlobalStyle('#dungeonMap { padding-bottom: 9.513%; }');
    addGlobalStyle('#click-delay-cont { display: flex; flex-direction: column; align-items: stretch;}')

    if (clickState == "ON") {
        autoClicker();
        calcClickDPS();
    }
    overideClickAttack();
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
        const clickSec = testDPS;
        let enemyHealth;
        try {
            enemyHealth = Battle.enemyPokemon().maxHealth();
        }
        catch (err) {
            enemyHealth = 0;
        }
        if (clickDPS != App.game.party.calculateClickAttack() * clickSec) {
            clickDPS = App.game.party.calculateClickAttack() * clickSec;
            document.getElementById('click-DPS').innerHTML = `Auto Click DPS:<br><div style="font-weight:bold;color:gold;">` + Math.floor(clickDPS).toLocaleString('en-US'); +`</div>`
            localStorage.setItem('storedClickDPS', clickDPS)
        }
        if (reqDPS != enemyHealth * clickSec) {
            reqDPS = enemyHealth * clickSec;
            if (clickDPS >= reqDPS) {
                colorDPS = "greenyellow"
            } else {
                colorDPS = "darkred"
            }
            document.getElementById('req-DPS').innerHTML = `Req. DPS:<br><div style="font-weight:bold;color:` + colorDPS + `">` + Math.ceil(reqDPS).toLocaleString('en-US'); +`</div>`
        }
        if (enemySpeedRaw != ((App.game.party.calculateClickAttack() * clickSec) / enemyHealth).toFixed(1)) {
            enemySpeed = ((App.game.party.calculateClickAttack() * clickSec) / enemyHealth);
            enemySpeedRaw = enemySpeed;
            if (isNaN(enemySpeedRaw) || enemySpeedRaw == 'Infinity' || Battle.catching()) {
                enemySpeed = 0;
            }
            if (enemySpeedRaw >= clickSec && enemySpeedRaw != 'Infinity' && !Battle.catching()) {
                enemySpeed = defeatDPS;
            }
            if (!Number.isInteger(enemySpeed) && enemySpeed != 0) { enemySpeed = enemySpeed.toFixed(1).toString().replace('.0', '') }
            document.getElementById('enemy-DPS').innerHTML = `Enemy/s:<br><div style="font-weight:bold;color:black;">` + enemySpeed + `</div>`
        }
        testDPS = 0;
        defeatDPS = 0;
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
        if (dungeonState == "ON" && DungeonRunner.fighting() == false && DungeonBattle.catching() == false) {
            autoDungeon();
        }
        //Reset the values for the boss coordinates if we timeout or turn off autoDungeon
        if ((dungeonState == "OFF" && foundBoss) || (dungeonState == "ON" && DungeonRunner.dungeonFinished() && foundBoss)){
            foundBoss = false
            bossCoords.length = 0
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
    }, delayAutoClick); // The app hard-caps click attacks at 50
}

function changeClickDelay(event) {
    const delay = +event.target.value;
    delayAutoClick = delay;
    localStorage.setItem("delayAutoClick", delay);
    overideClickAttack();
    if (clickState == "ON") {
        clearInterval(autoClickerLoop);
        autoClicker();
    }
    let clickSec = (1000 / delayAutoClick);
    document.getElementById('auto-click-delay-info').innerText = `Click Attack Delay: ` + clickDelayFixed(clickSec) + `/s`
}

function clickDelayFixed(int) {
    if (int != parseInt(int)) { int = int.toFixed(2) }
    return int;
}

function overideClickAttack() {
    // Overiding the game's function for Click Attack
    Battle.clickAttack = function() {
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
        testDPS++;
        if (!this.enemyPokemon().isAlive()) {
            this.defeatPokemon();
            defeatDPS++;
        }
    }
}

function autoGym() {
    if (player.town().content.length != 0) {
        //Might break in some towns, needs more testing
        if (player.town().content[0] instanceof Gym) {
            if (MapHelper.calculateTownCssClass(player.town().name) != "currentLocation") {
                MapHelper.moveToTown(player.town().name)
            }
            /*Don't think this can ever happen
            if (player.region != player.town().region) {
                player.region = player.town().region
            }*/

            if (App.game.gameState != GameConstants.GameState.gym) {
                //Checking if Champion exists here and is unlocked
                let champUnlocked;
                try {champUnlocked = player.town().content[4].isUnlocked()} catch (err) { champUnlocked = false }
                //If "All" is selected and the Champion is unlocked, then go through list of league fully from 0-4
                if (gymSelect === 5 && champUnlocked) {
                    GymRunner.startGym(player.town().content[allSelectedGym])
                    allSelectedGym++
                    if(allSelectedGym === 5) {
                        allSelectedGym = 0
                    }
                } else {
                    //If the content is a Gym or league champion and we unlocked it we fight
                    if ((player.town().content[gymSelect] instanceof Gym && player.town().content[gymSelect].isUnlocked()) || (player.town().content[gymSelect] instanceof Champion && player.town().content[gymSelect].isUnlocked())){
                        GymRunner.startGym(player.town().content[gymSelect])
                    }
                    else {
                        //Otherwise we try to fight the previous gyms (elite 4)
                        for (var i = player.town().content.length - 1; i >= 0; i--){
                            if ((player.town().content[i] instanceof Gym && player.town().content[i].isUnlocked()) || (player.town().content[i] instanceof Champion && player.town().content[i].isUnlocked())){
                                GymRunner.startGym(player.town().content[i])
                                break;
                            }
                        }
                    }
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
        if (MapHelper.calculateTownCssClass(player.town().name) != "currentLocation") {
            MapHelper.moveToTown(player.town().name)
        }
        //Don't think this condition is ever possible
        /*if (player.region != player.town().region) {
            player.region = player.town().region
        }*/
        if (getTokens >= dungeonCost && App.game.gameState != GameConstants.GameState.dungeon) {
            DungeonRunner.initializeDungeon(player.town().dungeon)
        }

        if (App.game.gameState === GameConstants.GameState.dungeon) {
            var dungeonBoard = DungeonRunner.map.board();
            //The boss can be found at any time
            if (foundBoss == false) {
                bossCoords = scan(dungeonBoard)
            }
            //Wander around until we can move to the boss tile
            //Pathfinding should be implemented here, A* looks like the best algorithm
            else if (foundBoss == true && dungeonSelect == 1){
                wander(dungeonBoard, bossCoords)
            }
            else if (dungeonSelect == 0){
                fullClear(dungeonBoard, bossCoords)
            }
        }
    }
}

function scan(dungeonBoard){
    /*var bossCoords = []
    var playerCoords = []*/
    for (var i = 0; i < dungeonBoard.length; i++){
        for (var j = 0; j<dungeonBoard[i].length; j++){
            if (dungeonBoard[i][j].type() == GameConstants.DungeonTile.boss){
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

function calculBestPath(dungeonBoard) {
    // javascript-astar 0.4.1
    // http://github.com/bgrins/javascript-astar
    // Freely distributable under the MIT License.
    // Implements the astar search algorithm in javascript using a Binary Heap.
    // Includes Binary Heap (with modifications) from Marijn Haverbeke.
    // http://eloquentjavascript.net/appendix2.html
    !function(t){if("object"==typeof module&&"object"==typeof module.exports)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();window.astar=n.astar,window.Graph=n.Graph}}(function(){function t(t){for(var n=t,i=[];n.parent;)i.unshift(n),n=n.parent;return i}var n={search:function(i,e,s,r){i.cleanDirty();var h=(r=r||{}).heuristic||n.heuristics.manhattan,c=r.closest||!1,u=new o(function(t){return t.f}),a=e;for(e.h=h(e,s),i.markDirty(e),u.push(e);u.size()>0;){var f=u.pop();if(f===s)return t(f);f.closed=!0;for(var p=i.neighbors(f),l=0,d=p.length;l<d;++l){var g=p[l];if(!g.closed&&!g.isWall()){var y=f.g+g.getCost(f),v=g.visited;(!v||y<g.g)&&(g.visited=!0,g.parent=f,g.h=g.h||h(g,s),g.g=y,g.f=g.g+g.h,i.markDirty(g),c&&(g.h<a.h||g.h===a.h&&g.g<a.g)&&(a=g),v?u.rescoreElement(g):u.push(g))}}}return c?t(a):[]},heuristics:{manhattan:function(t,n){return Math.abs(n.x-t.x)+Math.abs(n.y-t.y)},diagonal:function(t,n){var i=Math.sqrt(2),e=Math.abs(n.x-t.x),o=Math.abs(n.y-t.y);return 1*(e+o)+(i-2)*Math.min(e,o)}},cleanNode:function(t){t.f=0,t.g=0,t.h=0,t.visited=!1,t.closed=!1,t.parent=null}};function i(t,n){n=n||{},this.nodes=[],this.diagonal=!!n.diagonal,this.grid=[];for(var i=0;i<t.length;i++){this.grid[i]=[];for(var o=0,s=t[i];o<s.length;o++){var r=new e(i,o,s[o]);this.grid[i][o]=r,this.nodes.push(r)}}this.init()}function e(t,n,i){this.x=t,this.y=n,this.weight=i}function o(t){this.content=[],this.scoreFunction=t}return i.prototype.init=function(){this.dirtyNodes=[];for(var t=0;t<this.nodes.length;t++)n.cleanNode(this.nodes[t])},i.prototype.cleanDirty=function(){for(var t=0;t<this.dirtyNodes.length;t++)n.cleanNode(this.dirtyNodes[t]);this.dirtyNodes=[]},i.prototype.markDirty=function(t){this.dirtyNodes.push(t)},i.prototype.neighbors=function(t){var n=[],i=t.x,e=t.y,o=this.grid;return o[i-1]&&o[i-1][e]&&n.push(o[i-1][e]),o[i+1]&&o[i+1][e]&&n.push(o[i+1][e]),o[i]&&o[i][e-1]&&n.push(o[i][e-1]),o[i]&&o[i][e+1]&&n.push(o[i][e+1]),this.diagonal&&(o[i-1]&&o[i-1][e-1]&&n.push(o[i-1][e-1]),o[i+1]&&o[i+1][e-1]&&n.push(o[i+1][e-1]),o[i-1]&&o[i-1][e+1]&&n.push(o[i-1][e+1]),o[i+1]&&o[i+1][e+1]&&n.push(o[i+1][e+1])),n},i.prototype.toString=function(){for(var t=[],n=this.grid,i=0;i<n.length;i++){for(var e=[],o=n[i],s=0;s<o.length;s++)e.push(o[s].weight);t.push(e.join(" "))}return t.join("\n")},e.prototype.toString=function(){return"["+this.x+" "+this.y+"]"},e.prototype.getCost=function(t){return t&&t.x!=this.x&&t.y!=this.y?1.41421*this.weight:this.weight},e.prototype.isWall=function(){return 0===this.weight},o.prototype={push:function(t){this.content.push(t),this.sinkDown(this.content.length-1)},pop:function(){var t=this.content[0],n=this.content.pop();return this.content.length>0&&(this.content[0]=n,this.bubbleUp(0)),t},remove:function(t){var n=this.content.indexOf(t),i=this.content.pop();n!==this.content.length-1&&(this.content[n]=i,this.scoreFunction(i)<this.scoreFunction(t)?this.sinkDown(n):this.bubbleUp(n))},size:function(){return this.content.length},rescoreElement:function(t){this.sinkDown(this.content.indexOf(t))},sinkDown:function(t){for(var n=this.content[t];t>0;){var i=(t+1>>1)-1,e=this.content[i];if(!(this.scoreFunction(n)<this.scoreFunction(e)))break;this.content[i]=n,this.content[t]=e,t=i}},bubbleUp:function(t){for(var n=this.content.length,i=this.content[t],e=this.scoreFunction(i);;){var o,s=t+1<<1,r=s-1,h=null;if(r<n){var c=this.content[r];(o=this.scoreFunction(c))<e&&(h=r)}if(s<n){var u=this.content[s];this.scoreFunction(u)<(null===h?e:o)&&(h=s)}if(null===h)break;this.content[t]=this.content[h],this.content[h]=i,t=h}}},{astar:n,Graph:i}});
    // End of javascript-astar 0.4.1

    var openList = [];
    var posPlayer, posBoss;

    for (var i = 0; i < dungeonBoard.length; i++) {
      openList[i] = [];
      for (var j = 0; j < dungeonBoard[i].length; j++) {
        switch ( dungeonBoard[i][j].type() ) {
          case GameConstants.DungeonTile.empty:
            openList[i][j] = 3 ;
            break;
          case GameConstants.DungeonTile.entrance:
            openList[i][j] = 1 ;
            posPlayer = [i, j];
            break;
          case GameConstants.DungeonTile.enemy:
            openList[i][j] = 50;
            break;
          case GameConstants.DungeonTile.chest:
            openList[i][j] = 4 ;
            break;
          case GameConstants.DungeonTile.boss:
            openList[i][j] = 2 ;
            posBoss = [i, j];
            break;
        }
      }
    }

    // Keep to debug
    // console.table(openList);

    var graph = new Graph(openList);
    var start = graph.grid[posPlayer[0]][posPlayer[1]];
    var end = graph.grid[posBoss[0]][posBoss[1]];

    delete openList;
    delete posPlayer;
    delete posBoss;
    delete graph;
    delete start;
    delete end;

    return astar.search(graph, start, end);
}

function wander(dungeonBoard, bossCoords) {
    //Attempt to move to the boss if the coordinates are within movable range
    DungeonRunner.map.moveToCoordinates(bossCoords[1], bossCoords[0]);
    if (DungeonRunner.map.currentTile().type() === GameConstants.DungeonTile.boss) {
        foundBoss = false;
        bossCoords.length = 0;
        DungeonRunner.startBossFight();
    } else {
        var moveTo = [];
        var bestPath = calculBestPath(dungeonBoard);
        bestPath.forEach(function(tile) {
            if (moveTo.length === 0 && dungeonBoard[tile.x][tile.y].isVisited === false) {
                moveTo.push(tile.x, tile.y);
            }
        });

        //Coordinates saved in couples of [y, x] so we swap them when we want to move
        DungeonRunner.map.moveToCoordinates(moveTo[1], moveTo[0]);
        //Reset moves array
        delete moveTo;
        delete bestPath;
    }
}

function fullClear(dungeonBoard, bossCoords){
    //Get number of invisible tiles, if 0 we have the map
    var invisTile = document.getElementById('dungeonMap').querySelectorAll('.tile-invisible').length;
    //Chests
    var getChests = document.getElementById('dungeonMap').querySelectorAll('.tile-chest').length;
    //Enemies
    var getEnemy = document.getElementById('dungeonMap').querySelectorAll('.tile-enemy').length;

    for (var i = 0; i < dungeonBoard.length; i++){
        for (var j = 0; j<dungeonBoard[i].length; j++){
            //Basically just attempts to move to all tiles that aren't cleared
            if (dungeonBoard[i][j].isVisited == false){
                DungeonRunner.map.moveToCoordinates(j, i)
            }

            if (DungeonRunner.map.currentTile().type() == GameConstants.DungeonTile.chest){
                DungeonRunner.openChest()
            }
        }
    }
    //If we cleared the entire floor, move to the boss room and start the fight
    if (invisTile == 0 && getChests == 0 && getEnemy == 0 && foundBoss == true){
        DungeonRunner.map.moveToCoordinates(bossCoords[1], bossCoords[0])
        foundBoss = false
        bossCoords.length = 0
        DungeonRunner.startBossFight()
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
if (localStorage.getItem('delayAutoClick') == null) {
    localStorage.setItem("delayAutoClick", 50);
}
clickState = localStorage.getItem('autoClickState');
gymState = localStorage.getItem('autoGymState');
gymSelect = +localStorage.getItem('selectedGym');
dungeonState = localStorage.getItem('autoDungeonState');
dungeonSelect = localStorage.getItem('selectedDungeon');
delayAutoClick = localStorage.getItem('delayAutoClick');

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initAutoClicker()
        return result
    }
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

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}
