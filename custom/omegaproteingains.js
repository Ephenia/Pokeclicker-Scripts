// ==UserScript==
// @name        [Pokeclicker] Omega Protein Gains
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.0
// @author      Ephenia
// @description Removes the cap on the amount of Proteins that you can use on Pokémon which effectively makes them infinite use.
// ==/UserScript==

var proteinTable;
var awaitProteinTable;
var awaitOmegaProtein;
var newSave;
var trainerCards;

function initOmegaProtein() {
    document.getElementById('itemBag').querySelectorAll('div')[2].addEventListener('click', initProtein, true);
    
    function initProtein() {
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
    var scriptLoad = setInterval(function () {
        try {
            newSave = document.querySelectorAll('label')[0];
            trainerCards = document.querySelectorAll('.trainer-card');
        } catch (err) { }
        if (typeof newSave != 'undefined') {
            for (var i = 0; i < trainerCards.length; i++) {
                trainerCards[i].addEventListener('click', checkOmegaProtein, false);
            }
            newSave.addEventListener('click', checkOmegaProtein, false);
            clearInterval(scriptLoad)
        }
    }, 50);
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


function checkOmegaProtein() {
    awaitOmegaProtein = setInterval(function () {
        var gameState;
        try {
            gameState = App.game.gameState;
        } catch (err) { }
        if (typeof gameState != 'undefined') {
            initOmegaProtein();
            clearInterval(awaitOmegaProtein)
        }
    }, 1000);
}