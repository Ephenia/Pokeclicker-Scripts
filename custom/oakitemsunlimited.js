// ==UserScript==
// @name        [Pokeclicker] Oak Items Unlimited
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.0
// @author      Ephenia
// @description Removes the limit for the amount of Oak Items that you're able to equip so that you're able to equip all of them.
// ==/UserScript==

var newSave;
var oakItems;
var trainerCards;
var awaitOakItems;

function initOakItems() {
    var oakMax = oakItems.itemList.length;
    for (let i = 0; i < oakMax; i++) {
        App.game.oakItems.unlockRequirements[i] = 0;
    }
    oakItems.maxActiveCount(oakMax);
    document.getElementById('oakItemsModal').querySelector('h5').innerHTML = "Oak Items Equipped: " + oakItems.activeCount() + '/' + oakMax;
}

function loadScript(){
    var scriptLoad = setInterval(function () {
        try {
            newSave = document.querySelectorAll('label')[0];
            trainerCards = document.querySelectorAll('.trainer-card');
        } catch (err) { }
        if (typeof newSave != 'undefined') {
            for (var i = 0; i < trainerCards.length; i++) {
                trainerCards[i].addEventListener('click', checkOakItems, false);
            }
            newSave.addEventListener('click', checkOakItems, false);
            clearInterval(scriptLoad)
        }
    }, 50);
}

loadScript();

function checkOakItems() {
    awaitOakItems = setInterval(function () {
        try {
            oakItems = App.game.oakItems;
        } catch (err) { }
        if (typeof oakItems != 'undefined') {
            initOakItems();
            clearInterval(awaitOakItems)
        }
    }, 50);
}