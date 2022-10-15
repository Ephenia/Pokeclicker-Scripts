// ==UserScript==
// @name        [Pokeclicker] Challenge Mode Changer
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.2
// @author      Ephenia
// @description Lets you enable/disable any of the Challenges at any given point in time. This is compatiable with any save and will work on pre-existing saves. It's best to backup your save before using this.
// @updateURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/challengemodechanger.user.js
// ==/UserScript==

var chalNames = [];

function initChallenger() {
    var chalModal = document.getElementById('challengeModeModal');
    var chalList = App.game.challenges.list;
    for (var chal in chalList) {
        chalNames.push(chal)
    }
    remDisable();

    function remDisable() {
        var buttons = chalModal.querySelectorAll('button.btn');
        buttons.forEach((element, index) => {
            if (element.innerText === "ACTIVE" || element.innerText === "DISABLED") {
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

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initChallenger()
        return result
    }
}

var scriptName = 'challengemodechanger'

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