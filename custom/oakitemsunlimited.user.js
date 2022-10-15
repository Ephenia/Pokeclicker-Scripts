// ==UserScript==
// @name        [Pokeclicker] Oak Items Unlimited
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.0
// @author      Ephenia
// @description Removes the limit for the amount of Oak Items that you're able to equip so that you're able to equip all of them.
// @updateURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/oakitemsunlimited.user.js
// ==/UserScript==

function initOakItems() {
    var oakItems = App.game.oakItems
    var oakMax = oakItems.itemList.length;
    for (let i = 0; i < oakMax; i++) {
        oakItems.unlockRequirements[i] = 0;
    }
    oakItems.maxActiveCount(oakMax);
    document.getElementById('oakItemsModal').querySelector('h5').innerHTML = "Oak Items Equipped: " + oakItems.activeCount() + '/' + oakMax;
}

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initOakItems()
        return result
    }
}

var scriptName = 'oakitemsunlimited'

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