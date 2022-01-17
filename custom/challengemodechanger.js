// ==UserScript==
// @name        [Pokeclicker] Challenge Mode Changer
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.1
// @author      Ephenia
// @description Lets you enable/disable any of the Challenges at any given point in time. This is compatiable with any save and will work on pre-existing saves. It's best to backup your save before using this.
// ==/UserScript==

var awaitChallenger;
var chalList;
var chalNames = [];
var newSave;
var trainerCards;

function initChallenger() {
    chalList = App.game.challenges.list;
    for (var chal in chalList) {
        chalNames.push(chal)
    }
    remDisable();

    function remDisable() {
        var buttons = document.getElementById('challengeModeModal').querySelectorAll('button.btn');
        buttons.forEach((element, index) => {
            if (element.outerText == "ACTIVE" || element.outerText == "DISABLED") {
                element.setAttribute("data-index", index);
                element.classList.remove("disabled");
                element.addEventListener("click", toggleChallenge, false);
            }
        })
    }

    function toggleChallenge() {
        var index = this.getAttribute("data-index");
        chalCheck(index) ? chalChange(index, false) : chalChange(index, true);
        setTimeout(remDisable, 50);
    }

    function chalCheck(index) {
        return chalList[chalNames[index]].active();
    }

    function chalChange(index, boolean) {
        return chalList[chalNames[index]].active(boolean);
    }
}

var scriptLoad = setInterval(function () {
    try {
        newSave = document.querySelectorAll('label')[0];
        trainerCards = document.querySelectorAll('.trainer-card');
    } catch (err) { }
    if (typeof newSave != 'undefined') {
        for (var i = 0; i < trainerCards.length; i++) {
            trainerCards[i].addEventListener('click', checkChallenger, false);
        }
        newSave.addEventListener('click', checkChallenger, false);
        clearInterval(scriptLoad)
    }
}, 50);

function checkChallenger() {
    awaitChallenger = setInterval(function () {
        var gameState;
        try {
            gameState = App.game.gameState;
        } catch (err) { }
        if (gameState >= 2 && App.game.keyItems.hasKeyItem(3)) {
            initChallenger();
            clearInterval(awaitChallenger)
        }
    }, 1000);
}