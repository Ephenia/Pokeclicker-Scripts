// ==UserScript==
// @name          [Pokeclicker] Enhanced Auto Hatchery
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Original/Credit: Drak + Ivan Lay, Optimatum)
// @description   Automatically hatches eggs at 100% completion. Adds an On/Off button for auto hatching as well as an option for automatically hatching store bought eggs and dug up fossils.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       3.1.4

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautohatchery.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautohatchery.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

var hatchState;
var eggState;
var fossilState;
var shinyFossilState;
var pkrsState;
var pkrsHatcherySearchTime = 0;
var numMonsWithPkrsCached;
var autoHatcheryCachedList = [];
var hatchesSinceFilteredHatchery = 0;

function initAutoHatch() {
    const breedingDisplay = document.getElementById('breedingDisplay');
    const breedingModal = document.getElementById('breedingModal');

    breedingDisplay.querySelector('.card-header').outerHTML += `<button id= "auto-hatch-start" class="btn btn-sm btn-${hatchState ? 'success' : 'danger'}" style="position: absolute;left: 0px;top: 0px;width: 65px;height: 41px;font-size: 7pt;">
    Auto Hatch [${hatchState ? 'ON' : 'OFF'}]
    </button>`

    breedingModal.querySelector('.modal-header').querySelectorAll('button')[1].outerHTML += `<button id="pkrs-mode" class="btn btn-${pkrsState ? 'success' : 'danger'}" style="margin-left:20px;">
    PKRS Mode [${pkrsState ? 'ON' : 'OFF'}]
    </button>
    <button id="auto-egg" class="btn btn-${eggState ? 'success' : 'danger'}" style="margin-left:20px;">
    Auto Egg [${eggState ? 'ON' : 'OFF'}]
    </button>
    <button id="auto-fossil" class="btn btn-${fossilState ? 'success' : 'danger'}" style="margin-left:20px;">
    Auto Fossil [${fossilState ? 'ON' : 'OFF'}]
    </button>
    <button id="shiny-fossils" class="btn btn-${shinyFossilState ? 'success' : 'danger'}" style="margin-left:20px;">
    Shiny Fossils [${shinyFossilState ? 'ON' : 'OFF'}]
    </button>`;

    document.getElementById('auto-hatch-start').addEventListener('click', event => { toggleAutoHatch(event); });
    document.getElementById('auto-egg').addEventListener('click', event => { toggleEgg(event); });
    document.getElementById('auto-fossil').addEventListener('click', event => { toggleFossil(event); });
    document.getElementById('shiny-fossils').addEventListener('click', event => { toggleShinyFossil(event); });
    document.getElementById('pkrs-mode').addEventListener('click', event => { togglePKRS(event); });

    addGlobalStyle('.eggSlot.disabled { pointer-events: unset !important; }');

    // Initialize list since the game won't until the hatchery menu opens
    autoHatcheryCachedList = BreedingController.hatcherySortedFilteredList();

    // Immediately refresh the cached list when the filtered list or sort settings change
    const listUpdateObservables = [BreedingController.hatcheryFilteredList, Settings.getSetting('hatcherySort').observableValue, Settings.getSetting('hatcherySortDirection').observableValue];
    listUpdateObservables.forEach(observable => observable.subscribe(() => {
        autoHatcheryCachedList = BreedingController.hatcherySortedFilteredList();
    }));

    if (hatchState) {
        autoHatcher();
    }
}

function toggleAutoHatch(event) {
    const element = event.target;
    hatchState = !hatchState;
    if (hatchState) {
        autoHatcher();
    }
    element.classList.replace(...(hatchState ? ['btn-danger', 'btn-success'] : ['btn-success', 'btn-danger']));
    element.textContent = `Auto Hatch [${hatchState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('autoHatchState', hatchState);
}

function toggleEgg(event) {
    const element = event.target;
    eggState = !eggState;
    element.classList.replace(...(eggState ? ['btn-danger', 'btn-success'] : ['btn-success', 'btn-danger']));
    element.textContent = `Auto Egg [${eggState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('autoEgg', eggState);
}

function toggleFossil(event) {
    const element = event.target;
    fossilState = !fossilState;
    element.classList.replace(...(fossilState ? ['btn-danger', 'btn-success'] : ['btn-success', 'btn-danger']));
    element.textContent = `Auto Fossil [${fossilState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('autoFossil', fossilState);
}

function toggleShinyFossil(event) {
    const element = event.target;
    shinyFossilState = !shinyFossilState;
    element.classList.replace(...(shinyFossilState ? ['btn-danger', 'btn-success'] : ['btn-success', 'btn-danger']));
    element.textContent = `Shiny Fossils [${shinyFossilState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('shinyFossil', shinyFossilState);
}

function togglePKRS(event) {
    const element = event.target;
    pkrsState = !pkrsState;
    element.classList.replace(...(pkrsState ? ['btn-danger', 'btn-success'] : ['btn-success', 'btn-danger']));
    element.textContent = `PKRS Mode [${pkrsState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('pokerusModeState', pkrsState);
}

function bindAutoHatcher() {
    const progressEggsOld = Breeding.prototype.progressEggs;
    Breeding.prototype.progressEggs = function progressEggs(...args) {
        const result = progressEggsOld.apply(this, args);
        if (hatchState && App.game.breeding.canAccess()) {
            autoHatcher();
        }
        return result;
    }
}

function autoHatcher() {
    // Attempt to hatch eggs
    for (let i = App.game.breeding.eggSlots - 1; i >= 0; i--) {
        App.game.breeding.hatchPokemonEgg(i);
    }

    if (App.game.breeding.hasFreeEggSlot()) {
        // Sort list if it's been a while
        hatchesSinceFilteredHatchery += 1;
        if (hatchesSinceFilteredHatchery > 10) {
            autoHatcheryCachedList = BreedingController.hatcherySortedFilteredList();
            hatchesSinceFilteredHatchery = 0;
        }
    }

    while (App.game.breeding.hasFreeEggSlot()) {
        // Attempts enabled autoHatch methods in order until one succeeds
        // (subsequent autoHatch methods aren't called due to short-circuiting)
        let success = pkrsState && autoHatchPkrs();
        success ||= eggState && autoHatchEgg();
        success ||= fossilState && autoHatchFossil();
        success ||= autoHatchMon();
        if (!success) {
            break;
        }
    }
}

function autoHatchPkrs() {
    const delayAfterFailure = GameConstants.SECOND * 30;
    if (!App.game.keyItems.hasKeyItem(KeyItemType.Pokerus_virus)) {
        return false;
    }
    // No need to search if we already know there aren't party members to infect
    if (numMonsWithPkrsCached == App.game.party.caughtPokemon.length) {
        return false;
    }
    // If we couldn't find a uninfected/contagious pair, wait a while before trying again
    if (Date.now() - pkrsHatcherySearchTime < delayAfterFailure) {
        return false;
    }
    let uninfectedMono = {};
    let uninfectedDual = {};
    let contagious = {};
    let foundPair = false;
    let infectedCount = 0;
    // Find first uninfected/contagious pair sharing a type
    // Ideally the uninfected mon is dual-type to accelerate future spreading
    for (let mon of App.game.party.caughtPokemon) {
        infectedCount += mon.pokerus > GameConstants.Pokerus.Uninfected;
        if (mon.breeding || mon.level < 100) {
            continue;
        }
        let checkMatch = false;
        const { type: types } = pokemonMap[mon.name];
        if (mon.pokerus == GameConstants.Pokerus.Uninfected) {
            if (types.length == 2) {
                uninfectedDual[types[0]] ??= mon;
                uninfectedDual[types[1]] ??= mon;
                checkMatch = true;
            } else {
                uninfectedMono[types[0]] ??= mon;
            }
        } else if (mon.pokerus >= GameConstants.Pokerus.Contagious) {
            for (let type of types) {
                contagious[type] ??= mon;
                checkMatch = true;
            }
        }
        // Stop searching upon finding a infectable dual-type
        if (checkMatch) {
            for (let type of types) {
                if (type in uninfectedDual && type in contagious) {
                    foundPair = {'uninfected': uninfectedDual[type], 'contagious': contagious[type]};
                }
            }
            if (foundPair) {
                break;
            }
        }
    }
    if (!foundPair) {
        numMonsWithPkrsCached = infectedCount;
        // No infectable dual-type pokemon found, try a monotype
        for (let type of GameHelper.enumNumbers(PokemonType)) {
            if (type in uninfectedMono && type in contagious) {
                foundPair = {'uninfected': uninfectedMono[type], 'contagious': contagious[type]};
                break;
            }
        }
    }
    if (foundPair) {
        let success = App.game.breeding.addPokemonToHatchery(foundPair.uninfected) && App.game.breeding.addPokemonToHatchery(foundPair.contagious);
        numMonsWithPkrsCached += success;
        return success;
    } else {
        pkrsHatcherySearchTime = Date.now();
        return false;
    }
}

function autoHatchEgg() {
    let eggList = GameHelper.enumStrings(GameConstants.EggItemType).filter(e => ItemHandler.hasItem(e));
    if (eggList.length == 0) {
        return false;
    }
    let eggToUse = eggList[Math.floor(Math.random() * eggList.length)];
    return ItemList[eggToUse].use();
}

function autoHatchFossil() {
    // Fossils in inventory with amount > 0 
    let fossilList = UndergroundItems.list.filter(it => it.valueType === UndergroundItemValueType.Fossil && player.itemList[it.itemName]() > 0);
    if (fossilList.length == 0) {
        return false;
    }
    let priorityList = fossilList.filter(f => { 
        const caughtStatus = PartyController.getCaughtStatusByName(GameConstants.FossilToPokemon[f.name]);
        return caughtStatus == CaughtStatus.NotCaught || (shinyFossilState && caughtStatus == CaughtStatus.Caught);
    });
    if (priorityList.length) {
        fossilList = priorityList;
    }
    let fossilToUse = fossilList[Math.floor(Math.random() * fossilList.length)];
    // Workaround as sellMineItem returns null
    let before = player.amountOfItem(fossilToUse.itemName)
    UndergroundController.sellMineItem(fossilToUse);
    let after = player.amountOfItem(fossilToUse.itemName);
    return before > after;
}

function autoHatchMon() {
    let toHatch = autoHatcheryCachedList.find(p => p.isHatchable());
    if (!toHatch) {
        // Nothing matches the hatchery filters
        toHatch = App.game.party.caughtPokemon.find(p => p.isHatchable());
    }
    if (!toHatch) {
        return false;
    }
    return App.game.breeding.addPokemonToHatchery(toHatch);
}

hatchState = loadSetting('autoHatchState', false);
eggState = loadSetting('autoEgg', false);
fossilState = loadSetting('autoFossil', false);
shinyFossilState = loadSetting('shinyFossil', false);
pkrsState = loadSetting('pokerusModeState', false);

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

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
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

if (!App.isUsingClient || localStorage.getItem('enhancedautohatchery') === 'true') {
    loadEpheniaScript('enhancedautohatchery', initAutoHatch, bindAutoHatcher);
}