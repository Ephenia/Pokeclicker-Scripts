// ==UserScript==
// @name        [Pokeclicker] Enhanced Auto Clicker
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.2
// @author      Ephenia (Original/Credit: Ivan Lay)
// @description Clicks through battles appropriately depending on the game state. Also, includes a toggle button to turn Auto Clicking on or off.
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
var trainerCards = document.querySelectorAll('.trainer-card');
var battleView = document.getElementsByClassName('battle-view')[0];

function initAutoClicker() {
    if (clickState == "OFF") {
        clickColor = "danger"
        clickDPS = 0
    } else {
        clickColor = "success"
        clickDPS = +localStorage.getItem('storedClickDPS');
    }

    var elemAC = document.createElement("table")
    elemAC.innerHTML = `<tbody><tr><td colspan="3">
    <button id="auto-click-start" class="btn btn-`+clickColor+` btn-block" style="font-size:9pt;">
    Auto Click [`+clickState+`]<br>
    <div id="auto-click-info">
    <div id="click-DPS">Auto Click DPS: `+ clickDPS.toLocaleString('en-US') +`</div>
    <div id="req-DPS">Req. DPS: 0</div>
    <div id="enemy-DPS">Enemy/s: 0</div>
    </div>
    </button></td></tr></tbody>`
    battleView.before(elemAC)

//     document.getElementById('battleContainer').querySelector('tr').outerHTML += `<tbody><tr><td colspan="3">
//     <button id="auto-click-start" class="btn btn-`+clickColor+` btn-block" style="font-size:9pt;">
//     Auto Click [`+clickState+`]<br>
//     <div id="auto-click-info">
//     <div id="click-DPS">Auto Click DPS: `+ clickDPS.toLocaleString('en-US') +`</div>
//     <div id="req-DPS">Req. DPS: 0</div>
//     <div id="enemy-DPS">Enemy/s: 0</div>
//     </div>
//     </button></td></tr></tbody>`

    $("#auto-click-start").click (toggleAutoClick)
    addGlobalStyle('#auto-click-info { display: flex;flex-direction: row;justify-content: center; }');
    addGlobalStyle('#auto-click-info > div { width: 33.3%; }');

    if (clickState == "ON") {
        autoClicker();
        calcClickDPS();
    }
}

function toggleAutoClick() {
    if (clickState == "OFF") {
        clickState = "ON"
        localStorage.setItem("autoClickState", clickState);
        document.getElementById("auto-click-start").classList.remove('btn-danger');
        document.getElementById("auto-click-start").classList.add('btn-success');
        clickDPS = +localStorage.getItem('storedClickDPS');
        autoClicker();
        calcClickDPS();
    } else {
        clickState = "OFF"
        localStorage.setItem("autoClickState", clickState);
        document.getElementById("auto-click-start").classList.remove('btn-success');
        document.getElementById("auto-click-start").classList.add('btn-danger');
        clickDPS = 0;
        reqDPS = 0;
        enemySpeedRaw = 0;
        clearInterval(autoClickerLoop)
        clearInterval(autoClickDPS)
    }
    document.getElementById('auto-click-start').innerHTML = `Auto Click [`+clickState+`]<br>
    <div id="auto-click-info">
    <div id="click-DPS">Auto Click DPS: `+ clickDPS.toLocaleString('en-US') +`</div>
    <div id="req-DPS">Req. DPS: 0</div>
    <div id="enemy-DPS">Enemy/s: 0</div>
    </div>`
}

function calcClickDPS() {
    autoClickDPS = setInterval(function () {
        var enemyHealth;
        try {
            enemyHealth = Battle.enemyPokemon().maxHealth();
        }
        catch(err) {
            enemyHealth = 0;
        }

        if (clickDPS != App.game.party.calculateClickAttack() * 20) {
            clickDPS = App.game.party.calculateClickAttack() * 20;
            document.getElementById('click-DPS').innerHTML = `Auto Click DPS: `+ clickDPS.toLocaleString('en-US');
            localStorage.setItem('storedClickDPS', clickDPS)
        }
        if (reqDPS != enemyHealth * 20) {
            reqDPS = enemyHealth * 20;
            document.getElementById('req-DPS').innerHTML = `Req. DPS: `+ reqDPS.toLocaleString('en-US');
        }
        if (enemySpeedRaw != ((App.game.party.calculateClickAttack() * 20) / enemyHealth).toFixed(1)) {
            enemySpeed = ((App.game.party.calculateClickAttack() * 20) / enemyHealth).toFixed(1);
            enemySpeedRaw = enemySpeed
            console.log(enemySpeedRaw)
            if (enemySpeedRaw == 'Infinity') {
                enemySpeed = 0
            }
            if (enemySpeedRaw >= 20 && enemySpeedRaw != 'Infinity') {
                enemySpeed = 20
            }
            document.getElementById('enemy-DPS').innerHTML = `Enemy/s: `+ enemySpeed
        }
    }, 1000);
}

function autoClicker() {
  autoClickerLoop = setInterval(function () {
    // Click while in a normal battle
    if (App.game.gameState == GameConstants.GameState.fighting) {
      Battle.clickAttack();
    }

    // Click while in a gym battle
    if (App.game.gameState === GameConstants.GameState.gym) {
      GymBattle.clickAttack();
    }

    // Click while in a dungeon - will also interact with non-battle tiles (e.g. chests)
    if (App.game.gameState === GameConstants.GameState.dungeon) {
      if (DungeonRunner.fighting() && !DungeonBattle.catching()) {
        DungeonBattle.clickAttack();
      } else if (
        DungeonRunner.map.currentTile().type() ===
        GameConstants.DungeonTile.chest
      ) {
        DungeonRunner.openChest();
      } else if (
        DungeonRunner.map.currentTile().type() ===
          GameConstants.DungeonTile.boss &&
        !DungeonRunner.fightingBoss()
      ) {
        DungeonRunner.startBossFight();
      }
    }

    // Click while in Safari battles
    if (Safari.inBattle()) {
      BattleFrontierBattle.clickAttack();
    }
  }, 50); // The app hard-caps click attacks at 50
}

if (localStorage.getItem('autoClickState') == null) {
    localStorage.setItem("autoClickState", "OFF");
}
if (localStorage.getItem('storedClickDPS') == null) {
    localStorage.setItem("storedClickDPS", 0);
}
clickState = localStorage.getItem('autoClickState');

for (var i = 0; i < trainerCards.length; i++) {
    trainerCards[i].addEventListener('click', checkAutoClick, false);
}

function checkAutoClick() {
    awaitAutoClick = setInterval(function () {
        var gameState = App.game.gameState;
        if (typeof gameState === 'undefined') {
            console.log("Auto clicker isn't available yet.");
        } else {
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
