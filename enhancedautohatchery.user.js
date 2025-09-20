// ==UserScript==
// @name          [Pokeclicker] Enhanced Auto Hatchery
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Original/Credit: Drak + Ivan Lay, Optimatum)
// @description   Auto-hatches eggs at 100% and adds controls: Auto Hatch, PKRS Mode, Auto Egg, Auto Fossil, Shiny Fossils, Filter Only, and a Priority ID queue (e.g., 149,123,552,479.01) supporting alternate forms.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       3.3.0-priority

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
// Filter Only: restricts loading to current hatchery filter
var filterOnlyState;

// NEW: user-defined priority Pokémon IDs (array of numbers)
var priorityIdList = [];

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

    // Controls row in modal header
    const headerBtnContainer = breedingModal.querySelector('.modal-header').querySelectorAll('button')[1];
    headerBtnContainer.outerHTML += `
    <button id="pkrs-mode" class="btn btn-${pkrsState ? 'success' : 'danger'}" style="margin-left:20px;">
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
    </button>
    <button id="filter-only" class="btn btn-${filterOnlyState ? 'success' : 'danger'}" style="margin-left:20px;">
      Filter Only [${filterOnlyState ? 'ON' : 'OFF'}]
    </button>
    <!-- Priority input controls -->
    <div id="priority-controls" style="display:inline-flex; align-items:center; margin-left:20px; gap:8px;">
      <input id="priority-ids" type="text" inputmode="numeric" pattern="[0-9.,\\s-]*" placeholder="Priority IDs e.g. 149,123,552,479.01" style="max-width:260px; padding:3px 6px; font-size:12px;">
      <button id="priority-save" class="btn btn-primary btn-sm">Save Priority</button>
    </div>
    <span id="priority-status" style="margin-left:10px; font-size:12px; opacity:.8;"></span>
    `;

    document.getElementById('auto-hatch-start').addEventListener('click', toggleAutoHatch);
    document.getElementById('auto-egg').addEventListener('click', toggleEgg);
    document.getElementById('auto-fossil').addEventListener('click', toggleFossil);
    document.getElementById('shiny-fossils').addEventListener('click', toggleShinyFossil);
    document.getElementById('pkrs-mode').addEventListener('click', togglePKRS);
    document.getElementById('filter-only').addEventListener('click', toggleFilterOnly);

    // Load/render priority list UI
    renderPriorityUiFromStorage();
    document.getElementById('priority-save').addEventListener('click', savePriorityFromInput);

    addGlobalStyle('.eggSlot.disabled { pointer-events: unset !important; }');

    // Initialize list since the game won't until the hatchery menu opens
    autoHatcheryCachedList = BreedingController.hatcherySortedFilteredList();

    // Immediately refresh the cached list when the filtered list or sort settings change
    const listUpdateObservables = [
        BreedingController.hatcheryFilteredList,
        Settings.getSetting('hatcherySort').observableValue,
        Settings.getSetting('hatcherySortDirection').observableValue
    ];
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

function toggleFilterOnly(event) {
    const element = event.target;
    filterOnlyState = !filterOnlyState;
    element.classList.replace(...(filterOnlyState ? ['btn-danger', 'btn-success'] : ['btn-success', 'btn-danger']));
    element.textContent = `Filter Only [${filterOnlyState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('filterOnly', filterOnlyState);
}

// ---------- Priority IDs: storage, parsing, UI ----------

function renderPriorityUiFromStorage() {
    // Load from localStorage
    const raw = localStorage.getItem('priorityMonIds') || '[]';
    try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) priorityIdList = arr.map(n => Number(n)).filter(n => Number.isFinite(n) && n > 0);
    } catch {
        priorityIdList = [];
    }
    const input = document.getElementById('priority-ids');
    const status = document.getElementById('priority-status');
    input.value = priorityIdList.join(', ');
    status.textContent = priorityIdList.length ? `Priority: [${priorityIdList.join(', ')}]` : 'Priority: (none)';
}

function savePriorityFromInput() {
    const input = document.getElementById('priority-ids');
    const status = document.getElementById('priority-status');
    // Accept comma/space separated, tolerate extra chars - now supports decimal IDs
    const parts = input.value.split(/[^0-9.]+/).filter(Boolean);
    const parsed = parts.map(n => Number(n)).filter(n => Number.isFinite(n) && n > 0 && !isNaN(n));
    // De-duplicate while preserving order
    const seen = new Set();
    priorityIdList = parsed.filter(n => (seen.has(n) ? false : (seen.add(n), true)));

    localStorage.setItem('priorityMonIds', JSON.stringify(priorityIdList));
    status.textContent = priorityIdList.length ? `Priority: [${priorityIdList.join(', ')}]` : 'Priority: (none)';
    Notifier.notify({
        type: NotificationConstants.NotificationOption.success,
        title: '[Auto Hatchery]',
        message: `Saved priority IDs: ${priorityIdList.length ? priorityIdList.join(', ') : '(none)'}`,
        timeout: GameConstants.SECOND * 3,
    });
}

// Try adding the next available priority mon (highest priority first)
function autoHatchPriority() {
    if (!priorityIdList.length) return false;

    // Build quick lookup from party by Pokédex ID -> first hatchable instance
    // We'll scan per priority to keep order strict.
    for (let id of priorityIdList) {
        // Find a hatchable party member whose dex ID matches
        // Support both integer IDs (479) and decimal IDs (479.01) for alternate forms
        const mon = App.game.party.caughtPokemon.find(p => {
            if (!p || p.breeding || !p.isHatchable()) return false;
            // pokemonMap[p.name].id is available elsewhere in script (type was used earlier)
            const data = pokemonMap[p.name];
            if (!data) return false;
            
            // Exact match for decimal IDs (e.g., 479.01)
            if (data.id === id) return true;
            
            // For integer IDs, match both base forms and alternate forms
            // This allows 479 to match both 479 (base) and 479.01, 479.02, etc. (alternates)
            if (Number.isInteger(id) && Math.floor(data.id) === id) return true;
            
            return false;
        });
        if (mon) {
            return App.game.breeding.addPokemonToHatchery(mon);
        }
    }
    return false;
}

// --------------------------------------------------------

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
        // Priority list ALWAYS comes first (strict order)
        let success = autoHatchPriority();

        // Then PKRS / Eggs / Fossils
        success ||= pkrsState && autoHatchPkrs();
        success ||= eggState && autoHatchEgg();
        success ||= fossilState && autoHatchFossil();

        // Finally, standard list (respects Filter Only toggle)
        success ||= autoHatchMon();

        if (!success) break;
    }
}

function autoHatchPkrs() {
    const delayAfterFailure = GameConstants.SECOND * 30;
    if (!App.game.keyItems.hasKeyItem(KeyItemType.Pokerus_virus)) {
        return false;
    }
    if (numMonsWithPkrsCached == App.game.party.caughtPokemon.length) {
        return false;
    }
    if (Date.now() - pkrsHatcherySearchTime < delayAfterFailure) {
        return false;
    }
    let uninfectedMono = {};
    let uninfectedDual = {};
    let contagious = {};
    let foundPair = false;
    let infectedCount = 0;
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
        if (checkMatch) {
            for (let type of types) {
                if (type in uninfectedDual && type in contagious) {
                    foundPair = {'uninfected': uninfectedDual[type], 'contagious': contagious[type]};
                }
            }
            if (foundPair) break;
        }
    }
    if (!foundPair) {
        numMonsWithPkrsCached = infectedCount;
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
    let before = player.amountOfItem(fossilToUse.itemName)
    UndergroundController.sellMineItem(fossilToUse);
    let after = player.amountOfItem(fossilToUse.itemName);
    return before > after;
}

// Respects Filter Only toggle
function autoHatchMon() {
    let toHatch = autoHatcheryCachedList.find(p => p.isHatchable());
    if (filterOnlyState) {
        if (!toHatch) return false;
        return App.game.breeding.addPokemonToHatchery(toHatch);
    }
    if (!toHatch) {
        toHatch = App.game.party.caughtPokemon.find(p => p.isHatchable());
    }
    if (!toHatch) return false;
    return App.game.breeding.addPokemonToHatchery(toHatch);
}

hatchState = loadSetting('autoHatchState', false);
eggState = loadSetting('autoEgg', false);
fossilState = loadSetting('autoFossil', false);
shinyFossilState = loadSetting('shinyFossil', false);
pkrsState = loadSetting('pokerusModeState', false);
filterOnlyState = loadSetting('filterOnly', false);

// Load priority list once at boot (UI will re-render it)
try {
    const raw = localStorage.getItem('priorityMonIds') || '[]';
    const arr = JSON.parse(raw);
    priorityIdList = Array.isArray(arr) ? arr.map(n => Number(n)).filter(n => Number.isFinite(n) && n > 0) : [];
} catch { priorityIdList = []; }

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
    if (windowObject.epheniaScriptInitializers === undefined) {
        windowObject.epheniaScriptInitializers = {};
        const oldInit = Preload.hideSplashScreen;
        var hasInitialized = false;

        Preload.hideSplashScreen = function (...args) {
            var result = oldInit.apply(this, args);
            if (App.game && !hasInitialized) {
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
    windowObject.epheniaScriptInitializers[scriptName] = initFunction;
    if (priorityFunction) {
        $(document).ready(() => {
            try {
                priorityFunction();
            } catch (e) {
                reportScriptError(scriptName, e);
                windowObject.epheniaScriptInitializers[scriptName] = () => null;
            }
        });
    }
}

if (!App.isUsingClient || localStorage.getItem('enhancedautohatchery') === 'true') {
    loadEpheniaScript('enhancedautohatchery', initAutoHatch, bindAutoHatcher);
}