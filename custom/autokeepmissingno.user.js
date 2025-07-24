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

document.addEventListener("click", function (event) {
    const trainerCard = event.target.closest(".trainer-card");

    if (trainerCard !== null && trainerCard.dataset !== null) {
        const key = trainerCard.dataset.key;
        const rawData = localStorage.getItem(`save${key}`);
        const saveData = JSON.parse(rawData);
        const missingNoToKeep = saveData.party.caughtPokemon.find(pokemon => pokemon.id === 0);

        if (missingNoToKeep) {
            setTimeout(function () {
                const hasMissingNoBeenDeleted = App.game.party.getPokemonByName('MissingNo.') === undefined ? true : false;

                if (hasMissingNoBeenDeleted) {
                    const isShiny = missingNoToKeep[5] === undefined || missingNoToKeep[5] === false ? false : true;
                    App.game.party.gainPokemonById(0, isShiny);
                    const newMissingNo = App.game.party.getPokemonByName('MissingNo.');
                    createPartyPokemon(newMissingNo, missingNoToKeep);
                    overrideHatcheryFunction(newMissingNo);
                }
            }, 5000);
        }
    }
});

document.getElementById("redeemable-code-input").addEventListener('change', function() {
    if (this.value.toLowerCase() === "missingno" || this.value.toLowerCase() === "missingno.") {
           App.game.party.gainPokemonById(0, false);
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
    if (heldItemName !== undefined) {
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
}

function initkeepMissingNo() {
    PartyController.getVitaminFilteredList = overridePartyControllerMethods(PartyController.getVitaminFilteredList.toString());
    PartyController.getHeldItemFilteredList = overridePartyControllerMethods(PartyController.getHeldItemFilteredList.toString());

    if (App.game.party.caughtPokemon[0]) {
        overrideHatcheryFunction(App.game.party.caughtPokemon[0]);
    }
}

function overridePartyControllerMethods(functionToOverride) {
    const patchedFunction = functionToOverride.replace(/if\s*\(\s*pokemon\.id\s*<=\s*0\s*\)\s*\{\s*return\s*false;\s*\}/, '');
    const braceStart = patchedFunction.indexOf('{');
    const braceEnd = patchedFunction.lastIndexOf('}');
    let body = patchedFunction.slice(braceStart + 1, braceEnd).split('\n');

    return (new Function(body.join('\n')));
}

function overrideHatcheryFunction(missingNo) {
    delete missingNo.matchesHatcheryFilters;

    missingNo.matchesHatcheryFilters = ko.pureComputed(function () {
        // Check if search matches englishName or displayName
        const nameFilterSetting = Settings.getSetting('breedingNameFilter');
        if (nameFilterSetting.observableValue() != '') {
            const nameFilter = nameFilterSetting.regex();
            const displayName = PokemonHelper.displayName(this.name)();
            const partyName = this.displayName;
            if (!nameFilter.test(displayName) && !nameFilter.test(this.name) && !(partyName != undefined && nameFilter.test(partyName))) {
                return false;
            }
        }

        // Check if search matches species number
        const idFilter = Settings.getSetting('breedingIDFilter').observableValue();
        if (idFilter > -1 && idFilter != Math.floor(this.id)) {
            return false;
        }

        // Check based on categories
        const categoryFilter = Settings.getSetting('breedingCategoryFilter').observableValue();
        // Categorized only
        if (categoryFilter == -2 && this.isUncategorized()) {
            return false;
        }
        // Selected category
        if (categoryFilter >= 0 && !this.category.includes(categoryFilter)) {
            return false;
        }

        // Check based on shiny status
        const shinyFilter = Settings.getSetting('breedingShinyFilter').observableValue();
        if (shinyFilter >= 0 && +this.shiny !== shinyFilter) {
            return false;
        }

        // Check based on native region
        const unlockedRegionsMask = (2 << player.highestRegion()) - 1;
        const regionFilterMask = Settings.getSetting('breedingRegionFilter').observableValue() & unlockedRegionsMask;
        if (regionFilterMask !== unlockedRegionsMask) {
            const nativeRegion = PokemonHelper.calcNativeRegion(this.name);
            // With the region filter active, regionless pokemon should be shown only if no regions are selected
            const nativeRegionInFilter = nativeRegion !== GameConstants.Region.none ?
                (1 << nativeRegion) & regionFilterMask :
                regionFilterMask === 0;
            if (!nativeRegionInFilter) {
                return false;
            }
        }

        // Check based on Pokerus status
        const pokerusFilter = Settings.getSetting('breedingPokerusFilter').observableValue();
        if (pokerusFilter > -1 && this.pokerus !== pokerusFilter) {
            return false;
        }

        const uniqueTransformationFilter = Settings.getSetting('breedingUniqueTransformationFilter').observableValue();
        const pokemon = PokemonHelper.getPokemonById(this.id);
        // Only Base Pokémon with Mega available
        if (uniqueTransformationFilter == 'mega-available' && !PokemonHelper.hasMegaEvolution(pokemon.name)) {
            return false;
        }
        // Only Base Pokémon without Mega Evolution
        if (uniqueTransformationFilter == 'mega-unobtained' && !PokemonHelper.hasUncaughtMegaEvolution(pokemon.name)) {
            return false;
        }
        // Only Mega Pokémon
        if (uniqueTransformationFilter == 'mega-evolution' && !PokemonHelper.isMegaEvolution(pokemon.name)) {
            return false;
        }

        // Check to exclude alternate forms
        const hideAltFilter = Settings.getSetting('breedingHideAltFilter').observableValue();
        if (hideAltFilter && !Number.isInteger(pokemon.id)) {
            // Don't exclude alt forms native to a different region, as they're considered a main form for that region's progression
            const nativeRegion = PokemonHelper.calcNativeRegion(this.name);
            const hasBaseFormInSameRegion = pokemonList.some((p) => Math.floor(p.id) == Math.floor(pokemon.id) && p.id < pokemon.id && PokemonHelper.calcNativeRegion(p.name) == nativeRegion);
            if (hasBaseFormInSameRegion) {
                return false;
            }
        }

        // Check if either of the types match
        const type1 = Settings.getSetting('breedingType1Filter').observableValue();
        const type2 = Settings.getSetting('breedingType2Filter').observableValue();

        if (type1 !== null || type2 !== null) {
            const { type: types } = pokemonMap[this.name];
            if ([type1, type2].includes(PokemonType.None)) {
                const type = (type1 == PokemonType.None) ? type2 : type1;
                if (!BreedingController.isPureType(this, type)) {
                    return false;
                }
            } else if ((type1 !== null && !types.includes(type1)) || (type2 !== null && !types.includes(type2))) {
                return false;
            }
        }

        return true;
    }, missingNo);
}

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
        Preload.hideSplashScreen = function (...args) {
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