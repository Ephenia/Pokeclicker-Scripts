// ==UserScript==
// @name          [Pokeclicker] Perky Pokerus Pandemic
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   This script makes it so that Pokérus will spread from any contagious Pokémon (egg) in the Hatchery, regardless of types. It still will not spread from or to eggs with a Hatchery Helper.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       2.0.2

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/perkypokeruspandemic.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/perkypokeruspandemic.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

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

function loadEpheniaScript(scriptName, initFunction) {
    const windowObject = !App.isUsingClient ? unsafeWindow : window;
    // Inject handlers if they don't exist yet
    if (windowObject.epheniaScriptInitializers === undefined) {
        windowObject.epheniaScriptInitializers = {};
        const oldInit = Preload.hideSplashScreen;
        var hasInitialized = false;

        // Initializes scripts once enough of the game has loaded
        Preload.hideSplashScreen = function (...args) {
            var result = oldInit.apply(this, args);
            if (App.game && !hasInitialized) {
                // Initialize all attached userscripts
                Object.entries(windowObject.epheniaScriptInitializers).forEach(([scriptName, initFunction]) => {
                    try {
                        initFunction();
                    } catch (e) {
                        console.error(`Error while initializing '${scriptName}' userscript:\n${e}`);
                        Notifier.notify({
                            type: NotificationConstants.NotificationOption.warning,
                            title: scriptName,
                            message: `The '${scriptName}' userscript crashed while loading. Check for updates or disable the script, then restart the game.\n\nReport script issues to the script developer, not to the Pokéclicker team.`,
                            timeout: GameConstants.DAY,
                        });
                    }
                });
                hasInitialized = true;
            }
            return result;
        }
    }

    // Prevent issues with duplicate script names
    if (windowObject.epheniaScriptInitializers[scriptName] !== undefined) {
        console.warn(`Duplicate '${scriptName}' userscripts found!`);
        Notifier.notify({
            type: NotificationConstants.NotificationOption.warning,
            title: scriptName,
            message: `Duplicate '${scriptName}' userscripts detected. This could cause unpredictable behavior and is not recommended.`,
            timeout: GameConstants.DAY,
        });
        let number = 2;
        while (windowObject.epheniaScriptInitializers[`${scriptName} ${number}`] !== undefined) {
            number++;
        }
        scriptName = `${scriptName} ${number}`;
    }
    // Add initializer for this particular script
    windowObject.epheniaScriptInitializers[scriptName] = initFunction;
}

if (!App.isUsingClient || localStorage.getItem('perkypokeruspandemic') === 'true') {
    loadEpheniaScript('perkypokeruspandemic', initPokerusPandemic);
}
