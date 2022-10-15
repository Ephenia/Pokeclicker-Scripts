// ==UserScript==
// @name        [Pokeclicker] Catch Speed Adjuster
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.1
// @author      Ephenia
// @description Adjusts catch speed of all Pokeballs. Currently only makes Pokeballs catch as fast as possible.
// @updateURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/catchspeedadjuster.user.js
// ==/UserScript==

var ballAdjuster;
var defaultTime = [];

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

    if (ballAdjuster === "true") {
        document.getElementById('ball-adjust').checked = true;
        catchDelay();
    }

    function changeAdjust() {
        if (ballAdjuster === "true") {
            ballAdjuster = "false"
        } else {
            ballAdjuster = "true"
        }
        localStorage.setItem("ballAdjuster", ballAdjuster);
        catchDelay();
    }

    function catchDelay() {
        for (var i = 0; i < getBalls.length; i++) {
            if (ballAdjuster === "true") {
                getBalls[i].catchTime = 0;
            } else {
                getBalls[i].catchTime = defaultTime[i];
            }
        }
    }
}

if (localStorage.getItem('ballAdjuster') === null) {
    localStorage.setItem("ballAdjuster", "false");
}
ballAdjuster = localStorage.getItem('ballAdjuster');

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initBallAdjust()
        return result
    }
}

var scriptName = 'catchspeedadjuster'

if (document.getElementById('scriptHandler') !== undefined){
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) !== null){
        if (localStorage.getItem(scriptName) === 'true'){
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