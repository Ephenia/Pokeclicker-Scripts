// ==UserScript==
// @name          [Pokeclicker] Perky Pokerus Pandemic
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   This script makes it so that Pokérus will spread from any Pokémon (egg) that has it to all of the others inside of the Hatchery, instead of just types of Pokémon needing to match while in the Hatchery for this to be done.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.3

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/perkypokeruspandemic.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/perkypokeruspandemic.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

function calculatePokerus(index) {
    //This will always spread Pokerus and ignore types
    for (let i = index; i < App.game.breeding.eggList.length; i++) {
        const pokemon = App.game.breeding.eggList[i]().partyPokemon();
        if (pokemon && pokemon.pokerus === GameConstants.Pokerus.Uninfected) {
            pokemon.pokerus = GameConstants.Pokerus.Infected;
        }
    }
}

function initPokerusPandemic() {
    App.game.breeding.progressEggs = function(amount) {
        amount = Math.round(amount);
        let index = this.eggList.length;
        while (index-- > 0) {
            const helper = this.hatcheryHelpers.hired()[index];
            if (helper) {
                continue;
            }
            const egg = this.eggList[index]();
            const partyPokemon = egg.partyPokemon();
            if (!egg.isNone() && partyPokemon && partyPokemon.canCatchPokerus() && partyPokemon.pokerus === GameConstants.Pokerus.Uninfected) {
                calculatePokerus(index);
            }
            egg.addSteps(amount, this.multiplier);
            if (this._queueList().length && egg.canHatch()) {
                this.hatchPokemonEgg(index);
            }
        }
        this.hatcheryHelpers.addSteps(amount, this.multiplier);
    }
}

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initPokerusPandemic()
        return result
    }
}

var scriptName = 'perkypokeruspandemic'

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
