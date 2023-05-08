// ==UserScript==
// @name          [Pokeclicker] Omega Protein Gains
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   Removes the cap on the amount of Proteins that you can use on Pokémon which effectively makes them infinite use.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.1

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/omegaproteingains.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/omegaproteingains.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var vitaminTable;
var awaitvitaminTable;
var awaitOmegaProtein;
var newSave;
var trainerCards;
var vitaminType = {
    "Protein": 0,
    "Calcium": 1,
    "Carbos": 2
}
var vitaminName;

function initOmegaProtein() {
    // Didn't find any better for now... Will need to be edited each time a new vitamin is added to the game
    var tmp = document.querySelectorAll("#itemBag>div>div>div");
    divs = [tmp[0], tmp[1], tmp[2]];
    for (var i = 0; i < divs.length; i++) {
        divs[i].addEventListener('click', initProtein, true);
    }
    function initProtein(event) {
        // We need this to get the name of the vitamin to use
        vitaminName = event.target.closest('img');
        if (vitaminName === null) vitaminName = event.target.querySelector('img');
        if (vitaminName === null) vitaminName = event.target.previousElementSibling;
        vitaminName = vitaminName.src.split('/');
        vitaminName = vitaminName[vitaminName.length - 1].split('.')[0];

        //This setInterval is one of the few required ones because this table does not exist until loaded once
        awaitvitaminTable = setInterval(function () {
            var vitaminTable = document.querySelectorAll('#pokemonVitaminModal table>tbody')
            if (vitaminTable.length != 0) {
                clearInterval(awaitvitaminTable);
                vitaminTable[0].addEventListener('click', bypassProtein, true);
            }
        }, 50);
    }
}

function bypassProtein(event) {
    // Use the built-in functions to get the sorted list
    var child = event.target.closest('tr').rowIndex - 1;
    var pokemonList = PartyController.vitaminSortedList.sort(PartyController.compareBy(Settings.getSetting('vitaminSort').observableValue(), Settings.getSetting('vitaminSortDirection').observableValue()))[child];
    // Get the amount of vitamin owned
    var vitaminAmount = player.itemList[vitaminName]();
    var setVitamin = VitaminController.getMultiplier()
    var usedVitamin = vitaminAmount - setVitamin;
    // Get how many of these have been used until now
    var pokeVitamin = pokemonList.vitaminsUsed[vitaminType[vitaminName]]();
    if (setVitamin == Infinity && vitaminAmount > 0) {
        // Set the new amount of vitamin used
        pokemonList.vitaminsUsed[vitaminType[vitaminName]](pokeVitamin + vitaminAmount)
        // Remove as much as used
        player.itemList[vitaminName](0)
    } else if (usedVitamin >= 0) {
        // Set the new amount of vitamin used
        pokemonList.vitaminsUsed[vitaminType[vitaminName]](pokeVitamin + setVitamin)
        // Remove as much as used
        player.itemList[vitaminName](usedVitamin)
    } else {
        // No vitamin of this type left, time to buy some !
        Notifier.notify({
            message: `You don't have any ` + vitaminName + ` left...`,
            type: NotificationConstants.NotificationOption.danger,
        });
    }
    event.stopImmediatePropagation();
}

function loadScript() {
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function () {
        var result = oldInit.apply(this, arguments)
        initOmegaProtein()
        return result
    }
}

var scriptName = 'omegaproteingains'

if (document.getElementById('scriptHandler') != undefined) {
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) != null) {
        if (localStorage.getItem(scriptName) == 'true') {
            loadScript()
        }
    }
    else {
        localStorage.setItem(scriptName, 'true')
        loadScript()
    }
}
else {
    loadScript();
}
