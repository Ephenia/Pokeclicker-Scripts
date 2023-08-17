// ==UserScript==
// @name          [Pokeclicker] Omega Protein Gains
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   Removes the cap on the amount of Protein and Calcium that you can use on individual Pokémon, and raises the cap for Carbos.
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

var scriptName = 'omegaproteingains';
// 70 Carbos will make every (non-Magikarp) pokemon hatch in exactly 300 steps
const maxCarbos = 70;

function initOmegaProtein() {
    // Override useVitamin() to allow adding as many vitamins as desired (except Carbos)
    PartyPokemon.prototype.useVitamin = function (vitamin, amount) {
        if (App.game.challenges.list.disableVitamins.active()) {
            Notifier.notify({
                title: 'Challenge Mode',
                message: 'Vitamins are disabled',
                type: NotificationConstants.NotificationOption.danger,
            });
            return;
        }

        if (this.breeding) {
            Notifier.notify({
                message: 'Vitamins cannot be modified for Pokémon in the hatchery or queue.',
                type: NotificationConstants.NotificationOption.warning,
            });
            return;
        }

        // Limit Carbos to avoid potential bugs from instantly-hatching eggs
        if (vitamin === GameConstants.VitaminType.Carbos) {
            if (this.vitaminsUsed[GameConstants.VitaminType.Carbos]() >= maxCarbos) {
                Notifier.notify({
                    message: 'This Pokémon cannot hatch any faster!',
                    type: NotificationConstants.NotificationOption.warning,
                });
                return;
            }
            amount = Math.min(amount, Math.max(0, maxCarbos - this.vitaminsUsed[GameConstants.VitaminType.Carbos]()));
        }

        // The lower number of amount they want to use, total in inventory
        amount = Math.min(amount, player.itemList[GameConstants.VitaminType[vitamin]]());

        // Apply the vitamin
        if (ItemHandler.useItem(GameConstants.VitaminType[vitamin], amount)) {
            GameHelper.incrementObservable(this.vitaminsUsed[vitamin], amount);
        }
    }
}

function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args)
        if (App.game && !hasInitialized) {
            initOmegaProtein();
            hasInitialized = true;
        }
        return result;
    }
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
