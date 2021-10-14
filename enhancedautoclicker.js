// ==UserScript==
// @name        [Pokeclicker] Enhanced Auto Clicker
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.0
// @author      Ephenia (Original/Credit: Ivan Lay)
// @description Clicks through battles appropriately depending on the game state. Also, includes a toggle button to turn Auto Clicking on or off.
// ==/UserScript==

var clickState;
var clickColor;
var awaitAutoClick;
var autoClickerLoop;
var trainerCards = document.querySelectorAll('.trainer-card');

function initAutoClicker() {
    if (clickState == "OFF") {
        clickColor = "danger"
    } else {
        clickColor = "success"
    }

    document.getElementById('battleContainer').querySelector('tr').outerHTML += `<tr><td colspan="3">
    <button id="auto-click-start" class="btn btn-`+clickColor+` btn-block" style="font-size:9pt;">
    Auto Click [`+clickState+`]</button></td></tr>`
    $("#auto-click-start").click (toggleAutoClick)

    if (clickState == "ON") {
        autoClicker();
    }
}

function toggleAutoClick() {
    if (clickState == "OFF") {
        clickState = "ON"
        localStorage.setItem("autoClickState", clickState);
        document.getElementById("auto-click-start").classList.remove('btn-danger');
        document.getElementById("auto-click-start").classList.add('btn-success');
        autoClicker();
    } else {
        clickState = "OFF"
        localStorage.setItem("autoClickState", clickState);
        document.getElementById("auto-click-start").classList.remove('btn-success');
        document.getElementById("auto-click-start").classList.add('btn-danger');
        clearInterval(autoClickerLoop)
    }
    document.getElementById('auto-click-start').innerText = `Auto Click [`+clickState+`]`
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
