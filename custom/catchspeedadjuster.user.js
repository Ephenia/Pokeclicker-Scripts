// ==UserScript==
// @name          [Pokeclicker] Catch Speed Adjuster
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   Adjusts catch speed of all Pokeballs. Currently only makes Pokeballs catch as fast as possible.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.3

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/catchspeedadjuster.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/catchspeedadjuster.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'catchspeedadjuster';

var ballAdjuster;
var defaultTime = [];

function initBallAdjust() {
    var getBalls = App.game.pokeballs.pokeballs;
    for (var i = 0; i < getBalls.length; i++) {
        defaultTime.push(getBalls[i].catchTime)
    }
    var ballCont = document.getElementById('pokeballFilters');
    var ballAdj = document.createElement("tr");
    ballAdj.innerHTML = `<td colspan="3"><div style="height: 25px;"><label for="ball-adjust">0 Delay Capture <label><input id="ball-adjust" type="checkbox" style="position: relative;top: 2px;"></div></td>`
    ballCont.append(ballAdj)
    document.getElementById('pokeballSelectorBody').style.maxHeight = "285px";
    document.getElementById('ball-adjust').addEventListener('click', event => changeAdjust(event.target));

    if (ballAdjuster) {
        document.getElementById('ball-adjust').checked = true;
        catchDelay();
    }

    function changeAdjust(ele) {
        ballAdjuster = !ballAdjuster;
        localStorage.setItem("ballAdjuster", ballAdjuster);
        catchDelay();
    }

    function catchDelay() {
        for (var i = 0; i < getBalls.length; i++) {
            if (ballAdjuster) {
                getBalls[i].catchTime = 0;
            } else {
                getBalls[i].catchTime = defaultTime[i];
            }
        }
    }
}

if (localStorage.getItem('ballAdjuster') == null) {
    localStorage.setItem('ballAdjuster', 'false');
}
ballAdjuster = localStorage.getItem('ballAdjuster') == 'true';

function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args);
        if (App.game && !hasInitialized) {
            initBallAdjust();
            hasInitialized = true;
        }
        return result;
    }
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
