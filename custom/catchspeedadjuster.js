// ==UserScript==
// @name        [Pokeclicker] Catch Speed Adjuster
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.1
// @author      Ephenia
// @description Adjusts catch speed of all Pokeballs. Currently only makes Pokeballs catch as fast as possible.
// ==/UserScript==

var ballAdjuster;
var getBalls;
var awaitBallAdjust;
var defaultTime = [];
var newSave;
var trainerCards;

function initBallAdjust() {
    var getBalls = App.game.pokeballs.pokeballs;
    for (var i = 0; i < getBalls.length; i++) {
        defaultTime.push(getBalls[i].catchTime)
    }
    var ballCont = document.getElementById('pokeballSelectorBody').querySelector('thead');
    var ballAdj = document.createElement("tr");
    ballAdj.innerHTML = `<td colspan="4"><div style="height: 25px;"><label for="ball-adjust">0 Delay Capture <label><input id="ball-adjust" type="checkbox" style="position: relative;top: 2px;"></div></td>`
    ballCont.append(ballAdj)
    document.getElementById('ball-adjust').addEventListener('click', event => changeAdjust(event.target));

    if (ballAdjuster == "true") {
        document.getElementById('ball-adjust').checked = true;
        catchDelay();
    }

    function changeAdjust(ele) {
        if (ballAdjuster == "true") {
            ballAdjuster = "false"
        } else {
            ballAdjuster = "true"
        }
        localStorage.setItem("ballAdjuster", ballAdjuster);
        catchDelay();
    }

    function catchDelay() {
        for (var i = 0; i < getBalls.length; i++) {
            if (ballAdjuster == "true") {
                getBalls[i].catchTime = 0;
            } else {
                getBalls[i].catchTime = defaultTime[i];
            }
        }
    }
}

if (localStorage.getItem('ballAdjuster') == null) {
    localStorage.setItem("ballAdjuster", "false");
}
ballAdjuster = localStorage.getItem('ballAdjuster');

var scriptLoad = setInterval(function () {
    try {
        newSave = document.querySelectorAll('label')[0];
        trainerCards = document.querySelectorAll('.trainer-card');
    } catch (err) { }
    if (typeof newSave != 'undefined') {
        for (var i = 0; i < trainerCards.length; i++) {
            trainerCards[i].addEventListener('click', checkBallAdjust, false);
        }
        newSave.addEventListener('click', checkBallAdjust, false);
        clearInterval(scriptLoad)
    }
}, 50);

function checkBallAdjust() {
    awaitBallAdjust = setInterval(function () {
        var gameState;
        try {
            gameState = App.game.gameState;
        } catch (err) { }
        if (typeof gameState != 'undefined') {
            initBallAdjust();
            clearInterval(awaitBallAdjust)
        }
    }, 1000);
}
