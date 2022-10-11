// ==UserScript==
// @name        [Pokeclicker] Script Fixer Upper
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.1
// @author      Ephenia
// @description A script solely for clearing out localStorage without saves being affected. Meant to be a user friendly solution for this and or for users who aren't as tech literate.
// @updateURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/scriptfixerupper.user.js
// ==/UserScript==

function initFixerUpper() {
    function clearLocalStorage() {
        for (let i = 0; i < localStorage.length; i++){
            const key = localStorage.key(i);
            if (!key.includes('save') && !key.includes('player') && !key.includes('settings')) {
                localStorage.removeItem(key);
            }
        }
    }

    clearLocalStorage();
}

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initFixerUpper()
        return result
    }
}

var scriptName = 'scriptfixerupper'

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
