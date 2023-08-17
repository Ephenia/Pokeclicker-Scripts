// ==UserScript==
// @name          [Pokeclicker] Enhanced Auto Hatchery
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Original/Credit: Drak + Ivan Lay, Optimatum)
// @description   Automatically hatches eggs at 100% completion. Adds an On/Off button for auto hatching as well as an option for automatically hatching store bought eggs and dug up fossils.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       3.0

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautohatchery.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautohatchery.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'enhancedautohatchery';

var hatchState;
var eggState;
var fossilState;
var shinyFossilState;
var pkrsState;
var pkrsHatcherySearchTime = 0;
var numMonsWithPkrsCached;
var ticksSinceSortedHatchery = 0;

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
    PartyController.hatcherySortedList = [...App.game.party.caughtPokemon];
    const region = App.game.challenges.list.regionalAttackDebuff.active() ? BreedingController.regionalAttackDebuff() : -1;
    PartyController.hatcherySortedList.sort(PartyController.compareBy(Settings.getSetting('hatcherySort').observableValue(), Settings.getSetting('hatcherySortDirection').observableValue(), region));

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
    // Sort list if it's been a while
    ticksSinceSortedHatchery += 1;
    if (ticksSinceSortedHatchery > 40) {
        const region = App.game.challenges.list.regionalAttackDebuff.active() ? BreedingController.regionalAttackDebuff() : -1;
        PartyController.hatcherySortedList.sort(PartyController.compareBy(Settings.getSetting('hatcherySort').observableValue(), Settings.getSetting('hatcherySortDirection').observableValue(), region));
        ticksSinceSortedHatchery = 0;
    } 

    // Attempt to hatch eggs
    for (let i = App.game.breeding.eggSlots - 1; i >= 0; i--) {
        App.game.breeding.hatchPokemonEgg(i);
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
    for (let mon of PartyController.hatcherySortedList) {
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
    let fossilList = Object.keys(GameConstants.FossilToPokemon);
    // Fossils in inventory with amount > 0
    fossilList = fossilList.map(f => player.mineInventory().find(i => i.name == f && i.amount())).filter(f => f != undefined);
    if (shinyFossilState) {
        // Fossils where the shiny is not yet obtained
        fossilList = fossilList.filter(f => PartyController.getCaughtStatusByName(GameConstants.FossilToPokemon[f.name]) != CaughtStatus.CaughtShiny);
    }
    if (fossilList.length == 0) {
        return false;
    }
    let fossilToUse = fossilList[Math.floor(Math.random() * fossilList.length)];
    // Workaround as sellMineItem returns null
    let before = App.game.breeding.eggList.reduce((count, e) => count + !e().isNone(), 0);
    Underground.sellMineItem(fossilToUse.id);
    let after = App.game.breeding.eggList.reduce((count, e) => count + !e().isNone(), 0);
    return before < after;
}

function autoHatchMon() {
    let toHatch = PartyController.hatcherySortedList.find(p => p.isHatchable());
    if (!toHatch) {
        // Nothing matches the hatchery filters
        toHatch = PartyController.hatcherySortedList.find(p => !(p.breeding || p.level < 100));
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

function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function(...args) {
        var result = oldInit.apply(this, arguments);
        if (App.game && !hasInitialized) {
            initAutoHatch();
            hasInitialized = true;
        }
        return result;
    }

    bindAutoHatcher();
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}