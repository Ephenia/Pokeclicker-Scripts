// ==UserScript==
// @name          [Pokeclicker] Perky Pokerus Pandemic
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   This script makes it so that Pokérus will spread from any contagious Pokémon (egg) in the Hatchery, regardless of types. It still will not spread from or to eggs with a Hatchery Helper.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       2.0

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/perkypokeruspandemic.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/perkypokeruspandemic.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'perkypokeruspandemic';

function initPokerusPandemic() {
    const progressEggsOld = App.game.breeding.progressEggs;
    App.game.breeding.progressEggs = function(...args) {
        // Spread pokerus before applying egg progress
        if (App.game.keyItems.hasKeyItem(KeyItemType.Pokerus_virus)) {
            const hasContagious = App.game.breeding.eggList.some((egg, i) => {
                return !egg()?.isNone() && !egg().canHatch() && egg().partyPokemon()?.pokerus >= GameConstants.Pokerus.Contagious && (i > App.game.breeding.hatcheryHelpers.hired().length - 1);
            });
            if (hasContagious) {
                for (let i = App.game.breeding.hatcheryHelpers.hired().length; i < App.game.breeding.eggList.length; i++) {
                    let egg = App.game.breeding.eggList[i]();
                    if (!egg?.isNone() && egg.partyPokemon()?.pokerus == GameConstants.Pokerus.Uninfected) {
                        egg.partyPokemon().pokerus = GameConstants.Pokerus.Infected;
                    }
                }
            }
        }
        return progressEggsOld.apply(this, args);
    }
}

function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args);
        if (App.game && !hasInitialized) {
            initPokerusPandemic();
            hasInitialized = true;
        }
        return result;
    }
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
