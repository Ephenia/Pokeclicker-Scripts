/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
/* eslint-disable no-undef */
// ==UserScript==
// @name          [Pokeclicker] Auto Keep MissingNo
// @namespace     Pokeclicker Scripts
// @author        Skelman (Credit: Ephenia)
// @description   Keeps your missingno when deleted during pokéclicker updates.
// @copyright     https://github.com/hippolythe
// @license       GPL-3.0 License
// @version       1.0.0

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/autokeepmissingno.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/autokeepmissingno.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

document.addEventListener("click", function(event) {
    const trainerCard = event.target.closest(".trainer-card");

    if (trainerCard !== null && trainerCard.dataset !== null) {
        const key = trainerCard.dataset.key;
        const rawData = localStorage.getItem(`save${key}`);
        const saveData = JSON.parse(rawData);
        const missingNoToKeep = saveData.party.caughtPokemon.find(pokemon => pokemon.id === 0);

        if (missingNoToKeep) {
            setTimeout(function() {
                const hasMissingNoBeenDeleted = App.game.party.getPokemonByName('MissingNo.') === undefined ? true : false;

                if (hasMissingNoBeenDeleted) {
                    const isShiny = missingNoToKeep[5] === undefined || missingNoToKeep[5] === false ? false : true;
                    App.game.party.gainPokemonById(0, isShiny);
                    const newMissingNo = App.game.party.getPokemonByName('MissingNo.');
                    createPartyPokemon(newMissingNo, missingNoToKeep);
                }
            }, 5000);
        }
    }
});

function createPartyPokemon(newMissingNo, missingNoToKeep) {
    getVitamins(newMissingNo, missingNoToKeep[2]);
    getHeldItem(newMissingNo, missingNoToKeep[10]);

    newMissingNo.attackBonusPercent = missingNoToKeep[0];
    newMissingNo.attackBonusAmount = missingNoToKeep[1];
    newMissingNo.exp = missingNoToKeep[3];
    newMissingNo.category = missingNoToKeep[6];
    newMissingNo.pokerus = missingNoToKeep[8];
    newMissingNo.effortPoints = missingNoToKeep[9];
    newMissingNo.nickname = missingNoToKeep[12];
}

function getVitamins(newMissingNo, vitaminsUsed) {
    const proteinGets = player.itemList.Protein();
    const calciumGets = player.itemList.Calcium();
    const carbosGets = player.itemList.Carbos();

    player.itemList.Protein(proteinGets + vitaminsUsed[0]);
    player.itemList.Calcium(calciumGets + vitaminsUsed[1]);
    player.itemList.Carbos(carbosGets + vitaminsUsed[2]);

    newMissingNo.useVitamin(GameConstants.VitaminType.Protein, vitaminsUsed[0]);
    newMissingNo.useVitamin(GameConstants.VitaminType.Calcium, vitaminsUsed[1]);
    newMissingNo.useVitamin(GameConstants.VitaminType.Carbos, vitaminsUsed[2]);
}

function getHeldItem(newMissingNo, heldItemName) {
    const heldItem = new HeldItem(
        heldItemName,
        0,
        GameConstants.Currency.money, {
            maxAmount: 1
        },
        '',
        '',
        GameConstants.Region.kanto,
        (pokemon) => true
    );

    if (heldItem.name !== undefined) {
        const heldItemQuantity = player.itemList[heldItem.name]();
        player.itemList[heldItem.name](heldItemQuantity + 1);
        newMissingNo.giveHeldItem(heldItem);
    }
}

function initkeepMissingNo() {}

function loadSetting(key, defaultVal) {
    var val;
    try {
        val = JSON.parse(localStorage.getItem(key));
        if (val == null || typeof val !== typeof defaultVal) {
            throw new Error;
        }
    } catch {
        val = defaultVal;
        localStorage.setItem(key, defaultVal);
    }
    return val;
}

function loadEpheniaScript(scriptName, initFunction, priorityFunction) {
    function reportScriptError(scriptName, error) {
        console.error(`Error while initializing '${scriptName}' userscript:\n${error}`);
        Notifier.notify({
            type: NotificationConstants.NotificationOption.warning,
            title: scriptName,
            message: `The '${scriptName}' userscript crashed while loading. Check for updates or disable the script, then restart the game.\n\nReport script issues to the script developer, not to the Pokéclicker team.`,
            timeout: GameConstants.DAY,
        });
    }
    const windowObject = window;
    // Inject handlers if they don't exist yet
    if (windowObject.epheniaScriptInitializers === undefined) {
        windowObject.epheniaScriptInitializers = {};
        const oldInit = Preload.hideSplashScreen;
        var hasInitialized = false;

        // Initializes scripts once enough of the game has loaded
        Preload.hideSplashScreen = function(...args) {
            var result = oldInit.apply(this, args);
            if (App.game && !hasInitialized) {
                // Initialize all attached userscripts
                Object.entries(windowObject.epheniaScriptInitializers).forEach(([scriptName, initFunction]) => {
                    try {
                        initFunction();
                    } catch (e) {
                        reportScriptError(scriptName, e);
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
    // Run any functions that need to execute before the game starts
    if (priorityFunction) {
        $(document).ready(() => {
            try {
                priorityFunction();
            } catch (e) {
                reportScriptError(scriptName, e);
                // Remove main initialization function
                windowObject.epheniaScriptInitializers[scriptName] = () => null;
            }
        });
    }
}

if (!App.isUsingClient || localStorage.getItem('autokeepmissingno') === 'true') {
    loadEpheniaScript('autokeepmissingno', initkeepMissingNo);
}