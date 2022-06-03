// ==UserScript==
// @name        [Pokeclicker] Omega Protein Gains
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.0
// @author      Ephenia
// @description Removes the cap on the amount of Proteins that you can use on Pokémon which effectively makes them infinite use.
// @updateURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/omegaproteingains.user.js
// ==/UserScript==

var proteinTable;
var awaitProteinTable;
var awaitOmegaProtein;
var newSave;
var trainerCards;

function initOmegaProtein() {
    document.getElementById('itemBag').querySelectorAll('div')[2].addEventListener('click', initProtein, true);
    
    function initProtein() {
        //This setInterval is one of the few required ones because this table does not exist until loaded once
        awaitProteinTable = setInterval(function () {
            proteinTable = document.getElementById('pokemonSelectorModal').querySelectorAll('tbody')
            if (proteinTable.length != 0) {
                clearInterval(awaitProteinTable);
                proteinTable[0].addEventListener('click', bypassProtein, true);
                function bypassProtein(event) {
                    var child = event.target.closest('tr').rowIndex - 1;
                    var protein = player.itemList.Protein();
                    var setProtein = VitaminController.getMultiplier()
                    var usedProtein = protein - setProtein;
                    var pokeProtein = PartyController.getProteinSortedList()[child].proteinsUsed()
                    if (setProtein == Infinity && protein > 0) {
                        PartyController.getProteinSortedList()[child].proteinsUsed(pokeProtein + protein)
                        player.itemList.Protein(0)
                    } else if (usedProtein >= 0) {
                        PartyController.getProteinSortedList()[child].proteinsUsed(pokeProtein + setProtein)
                        player.itemList.Protein(usedProtein)
                    } else {
                        Notifier.notify({
                            message: `You don't have any Proteins left...`,
                            type: NotificationConstants.NotificationOption.danger,
                        });
                    }
                    event.stopImmediatePropagation();
                }
            }
        }, 50);
    }
}

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initOmegaProtein()
        return result
    }
}

var scriptName = 'omegaproteingains'

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