// ==UserScript==
// @name          [Pokeclicker] Perky Pokerus Pandemic
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   This script makes it so that Pokérus will spread from any Pokémon (egg) that has it to all of the others inside of the Hatchery, instead of just your starter needing to be in the Hatchery for this to be done.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.2

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/perkypokeruspandemic.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/perkypokeruspandemic.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

function initPokerusPandemic() {
    App.game.breeding.progressEggs = function(amount) {
        amount *= this.getStepMultiplier();

        amount = Math.round(amount);
        let index =  this.eggList.length;
        while (index-- > 0) {
            const helper = this.hatcheryHelpers.hired()[index];
            if (helper) {
                continue;
            }
            const egg = this.eggList[index]();
            const partyPokemon = App.game.party.caughtPokemon.find(p => p.name == egg.pokemon);
            if (!egg.isNone() && partyPokemon && partyPokemon.canCatchPokerus() && !partyPokemon.pokerus) {
                partyPokemon.pokerus = calculatePokerus();
                function calculatePokerus() {
                    return App.game.breeding.eggList.some(e => {
                        let eggPkrs;
                        try {
                            eggPkrs = App.game.party.caughtPokemon.find(p => p.name == e().pokemon).pokerus;
                            if (!e().canHatch() && !e().isNone() && eggPkrs) {
                                const pokemon = App.game.party.getPokemon(PokemonHelper.getPokemonByName(e().pokemon).id);
                                return pokemon.pokerus;
                            }
                        } catch (err) {
                            return true;
                        }
                    });
                }
            }
            egg.addSteps(amount, this.multiplier);
            if (this.queueList().length && egg.progress() >= 100) {
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
