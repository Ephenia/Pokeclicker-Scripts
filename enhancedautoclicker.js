// ==UserScript==
// @name        [Pokeclicker] Enhanced Auto Clicker
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.4
// @author      Ephenia (Original/Credit: Ivan Lay)
// @description Clicks through battles appropriately depending on the game state. Also, includes a toggle button to turn Auto Clicking on or off and various insightful statistics. Now also includes an automatic Gym battler.
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
    if (gymState == "OFF") {
        gymColor = "danger"
    } else {
        gymColor = "success"
    }

    var elemAC = document.createElement("table")
    elemAC.innerHTML = `<tbody><tr><td colspan="3">
    <button id="auto-click-start" class="btn btn-`+clickColor+` btn-block" style="font-size:8pt;">
    Auto Click [`+clickState+`]<br>
    <div id="auto-click-info">
    <div id="click-DPS">Auto Click DPS:<br><div style="font-weight:bold;color:gold;">`+ clickDPS.toLocaleString('en-US') +`</div></div>
    <div id="req-DPS">Req. DPS:<br><div style="font-weight:bold;">0</div></div>
    <div id="enemy-DPS">Enemy/s:<br><div style="font-weight:bold;color:black;">0</div></div>
    </div>
    </button></td></tr>
    <tr>
    <td style="width: 100%;">
    <button id="auto-gym-start" class="btn btn-block btn-`+gymColor+`" style="font-size: 8pt;">
    Auto Gym [`+gymState+`]
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

    $("#auto-click-start").click (toggleAutoClick)
    $("#auto-gym-start").click (toggleAutoGym)
    $("#gym-select").change (changeSelectedGym)
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
    document.getElementById('auto-click-start').innerHTML = `Auto Click [`+clickState+`]<br>
    <div id="auto-click-info">
    <div id="click-DPS">Auto Click DPS:<br><div style="font-weight:bold;color:gold;">`+ clickDPS.toLocaleString('en-US') +`</div></div>
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
    document.getElementById('auto-gym-start').innerHTML = `Auto Gym [`+gymState+`]`
}

function changeSelectedGym() {
    gymSelect = +document.getElementById('gym-select').value
    localStorage.setItem("selectedGym", gymSelect);
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
            document.getElementById('click-DPS').innerHTML = `Auto Click DPS:<br><div style="font-weight:bold;color:gold;">`+ clickDPS.toLocaleString('en-US'); +`</div>`
            localStorage.setItem('storedClickDPS', clickDPS)
        }
        if (reqDPS != enemyHealth * 20) {
            reqDPS = enemyHealth * 20;
            if (clickDPS >= reqDPS) {
                colorDPS = "greenyellow"
            } else {
                colorDPS = "darkred"
            }
            document.getElementById('req-DPS').innerHTML = `Req. DPS:<br><div style="font-weight:bold;color:`+ colorDPS +`">`+ reqDPS.toLocaleString('en-US'); +`</div>`
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
            document.getElementById('enemy-DPS').innerHTML = `Enemy/s:<br><div style="font-weight:bold;color:black;">`+ enemySpeed +`</div>`
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
if (localStorage.getItem('autoGymState') == null) {
    localStorage.setItem("autoGymState", "OFF");
}
if (localStorage.getItem('selectedGym') == null) {
    localStorage.setItem("selectedGym", 0);
}
clickState = localStorage.getItem('autoClickState');
gymState = localStorage.getItem('autoGymState');
gymSelect = +localStorage.getItem('selectedGym');

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
