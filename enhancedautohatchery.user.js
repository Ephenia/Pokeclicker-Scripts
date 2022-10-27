// ==UserScript==
// @name          [Pokeclicker] Enhanced Auto Hatchery
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Original/Credit: Drak + Ivan Lay)
// @description   Automatically hatches eggs at 100% completion. Adds an On/Off button for auto hatching as well as an option for automatically hatching store bought eggs and dug up fossils.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       2.3

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautohatchery.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautohatchery.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var hatchState;
var awaitAutoHatch;
var autoHatchLoop;
var randFossilEgg;
var eggState;
var fossilState;
var shinyFossilState;
var hatcherySortVal;
var hatcherySortDir;
var hatcherySortSync;
var pkrsState;
var pkrsStrict;

function initAutoHatch() {
    const breedingDisplay = document.getElementById('breedingDisplay');
    const breedingModal = document.getElementById('breedingModal');

    breedingDisplay.querySelector('.card-header').outerHTML += `<button id= "auto-hatch-start" class="btn btn-sm btn-${hatchState ? 'success' : 'danger'}" style="position: absolute;left: 0px;top: 0px;width: 65px;height: 41px;font-size: 7pt;">
    Auto Hatch [${hatchState ? 'ON' : 'OFF'}]
    </button>`

    breedingModal.querySelector('.modal-header').querySelectorAll('button')[1].outerHTML += `<button id="sort-sync" class="btn btn-${hatcherySortSync ? 'success' : 'danger'}" style="margin-left:20px;">
    Pokemon List Sync [${hatcherySortSync ? 'ON' : 'OFF'}]
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
    <button id="pkrs-mode" class="btn btn-${pkrsState ? 'success' : 'danger'}" style="margin-left:20px;">
    PKRS Mode [${pkrsState ? 'ON' : 'OFF'}]
    </button>
    <button id="pkrs-strict" class="btn btn-${pkrsStrict ? 'success' : 'danger'}" style="margin-left:20px;">
    PKRS Strict [${pkrsStrict ? 'ON' : 'OFF'}]
    </button>`

    document.getElementById('auto-hatch-start').addEventListener('click', event => { toggleAutoHatch(event); });
    document.getElementById('sort-sync').addEventListener('click', event => { changesortsync(event); });
    document.getElementById('auto-egg').addEventListener('click', event => { toggleEgg(event); });
    document.getElementById('auto-fossil').addEventListener('click', event => { toggleFossil(event); });
    document.getElementById('shiny-fossils').addEventListener('click', event => { toggleShinyFossil(event); });
    document.getElementById('pkrs-mode').addEventListener('click', event => { togglePKRS(event); });
    document.getElementById('pkrs-strict').addEventListener('click', event => { togglePKRSStrict(event); });

    addGlobalStyle('.eggSlot.disabled { pointer-events: unset !important; }');

    if (hatchState) { autoHatcher(); }
}

function toggleAutoHatch(event) {
    const element = event.target;
    hatchState = !hatchState;
    hatchState ? autoHatcher() : clearInterval(autoHatchLoop);
    hatchState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Auto Hatch [${hatchState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('autoHatchState', hatchState);
}

function changesortsync(event) {
    const element = event.target;
    hatcherySortSync = !hatcherySortSync;
    hatcherySortSync ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Pokemon List Sync [${hatcherySortSync ? 'ON' : 'OFF'}]`;
    localStorage.setItem('hatcherySortSync', hatcherySortSync);
}

function toggleEgg(event) {
    const element = event.target;
    eggState = !eggState;
    eggState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Auto Egg [${eggState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('autoEgg', eggState);
}

function toggleFossil(event) {
    const element = event.target;
    fossilState = !fossilState;
    fossilState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Auto Fossil [${fossilState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('autoFossil', fossilState);
}

function toggleShinyFossil(event) {
    const element = event.target;
    shinyFossilState = !shinyFossilState;
    shinyFossilState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Shiny Fossils [${shinyFossilState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('shinyFossil', shinyFossilState);
}

function togglePKRS(event) {
    const element = event.target;
    pkrsState = !pkrsState;
    pkrsState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `PKRS Mode [${pkrsState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('pokerusModeState', pkrsState);
}

function togglePKRSStrict(event) {
    const element = event.target;
    pkrsStrict = !pkrsStrict;
    pkrsStrict ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `PKRS Strict [${pkrsStrict ? 'ON' : 'OFF'}]`;
    localStorage.setItem('pokerusModeStrict', pkrsStrict);
}

function autoHatcher() {
    autoHatchLoop = setInterval(function () {
        //change daycare sorting
        if (hatcherySortSync) {
            const pS = Settings.getSetting('partySort');
            const hS = Settings.getSetting('hatcherySort');
            if (pS.observableValue() != hatcherySortVal) {
                hS.observableValue(pS.observableValue())
                hatcherySortVal = pS.observableValue()
                localStorage.setItem("hatcherySortVal", hatcherySortVal);
            }
            if (hS.observableValue() != hatcherySortVal) {
                hatcherySortVal = hS.observableValue()
                pS.observableValue(hS.observableValue())
                localStorage.setItem("hatcherySortVal", hatcherySortVal);
            }

            const pSD = Settings.getSetting('partySortDirection');
            const hSD = Settings.getSetting('hatcherySortDirection');
            if (pSD.observableValue() != hatcherySortDir) {
                hatcherySortDir = pSD.observableValue()
                hSD.observableValue(pSD.observableValue())
                localStorage.setItem("hatcherySortDir", hatcherySortDir);
            }
            if (hSD.observableValue() != hatcherySortDir) {
                hatcherySortDir = hSD.observableValue()
                pSD.observableValue(hSD.observableValue())
                localStorage.setItem("hatcherySortDir", hatcherySortDir);
            }
        }

        // Attempt to hatch each egg. If the egg is at 100% it will succeed
        [0, 1, 2, 3].forEach((index) => App.game.breeding.hatchPokemonEgg(index));

        // Now add eggs to empty slots if we can
        while (
            App.game.breeding.canAccess() == true && // Can access the Hatchery
            App.game.party.hasMaxLevelPokemon() && // Don't run if you don't have any level 100 Pokemon
            App.game.breeding.hasFreeEggSlot() // Has an open egg slot
        ) {
            var hasEgg;
            var hasFossil;
            if (eggState) {
                var randEggIndex;
                var storedEggName = [];
                const eggTypesLength = GameConstants.EggItemType[0].length;
                const eggTypes = GameConstants.EggItemType;
                for (var i = 0; i < eggTypesLength; i++) {
                    const selEgg = eggTypes[i]
                    if (player._itemList[selEgg]() > 0) {
                        storedEggName.push(selEgg)
                    }
                }
                if (storedEggName.length != 0) {
                    randEggIndex = ((Math.floor(Math.random() * storedEggName.length) + 1) - 1)
                    hasEgg = true;
                } else {
                    hasEgg = false
                }
            }

            let randFossilIndex;
            const storedFossilID = [];
            if (fossilState) {
                const storedFossilName = [];
                const treasureLength = player.mineInventory().length;
                for (var e = 0; e < treasureLength; e++) {
                    const valueType = player.mineInventory()[e].valueType;
                    //valueType 3 equals fossil or old "Mine Egg" type
                    const itemAmount = player.mineInventory()[e].amount()
                    if (valueType == 3 && itemAmount > 0) {
                        const fossilName = player.mineInventory()[e].name;
                        const fossilID = player.mineInventory()[e].id;
                        const fossilePoke = GameConstants.FossilToPokemon[fossilName];
                        // 0 = Not caught yet, 1 = Non-Shiny, 2 = Already Shiny
                        const checkShiny = PartyController.getCaughtStatusByName(fossilePoke);
                        const pokeRegion = PokemonHelper.calcNativeRegion(fossilePoke)
                        const validFossil = pokeRegion <= player.highestRegion();
                        const shinyFossilize = shinyFossilState && checkShiny != 2;
                        if (validFossil && shinyFossilize || validFossil && !shinyFossilState) {
                            storedFossilName.push(fossilName)
                            storedFossilID.push(fossilID)
                        }
                    }
                }
                if (storedFossilID.length != 0) {
                    randFossilIndex = ((Math.floor(Math.random() * storedFossilID.length) + 1) - 1)
                    hasFossil = true;
                } else {
                    hasFossil = false;
                }
            }

            if (eggState || fossilState) {
                if (hasEgg == true && hasFossil == true) {
                    const isEggFossil = (Math.floor(Math.random() * 2) + 1)
                    if (isEggFossil == 1) {
                        ItemList[storedEggName[randEggIndex]].use()
                        return true;
                    } else {
                        Underground.sellMineItem(storedFossilID[randFossilIndex])
                        return true;
                    }
                } else if (hasEgg == true) {
                    ItemList[storedEggName[randEggIndex]].use()
                    return true;
                } else if (hasFossil == true) {
                    Underground.sellMineItem(+storedFossilID[randFossilIndex])
                    return true;
                }
            }

            // Filter the sorted list of Pokemon based on the parameters set in the Hatchery screen
            let filteredEggList = PartyController.getSortedList().filter((partyPokemon) => {
                // Only breedable Pokemon
                if (partyPokemon.breeding || partyPokemon.level < 100) {
                    return false;
                }
                // Check based on category
                if (BreedingFilters.category.value() >= 0) {
                    if (partyPokemon.category !== BreedingFilters.category.value()) {
                        return false;
                    }
                }
                // Check based on shiny status
                if (BreedingFilters.shinyStatus.value() >= 0) {
                    if (+partyPokemon.shiny !== BreedingFilters.shinyStatus.value()) {
                        return false;
                    }
                }
                // Check based on native region
                const useRegion = BreedingFilters.region.value() == 2 ** (player.highestRegion() + 1) - 1;
                if (!useRegion) {
                    const regionVal = [1, 2, 4, 8, 16, 32, 64, 128];
                    const pokeNatRegion = PokemonHelper.calcNativeRegion(partyPokemon.name);
                    if (regionVal[pokeNatRegion] !== BreedingFilters.region.value()) {
                        return false;
                    }
                }
                // Check if either of the types match
                const type1 = BreedingFilters.type1.value() > -2 ? BreedingFilters.type1.value() : null;
                const type2 = BreedingFilters.type2.value() > -2 ? BreedingFilters.type2.value() : null;
                if (type1 !== null || type2 !== null) {
                    const { type: types } = pokemonMap[partyPokemon.name];
                    if ([type1, type2].includes(PokemonType.None)) {
                        const type = type1 == PokemonType.None ? type2 : type1;
                        if (!BreedingController.isPureType(partyPokemon, type)) {
                            return false;
                        }
                    } else if (
                        (type1 !== null && !types.includes(type1)) ||
                        (type2 !== null && !types.includes(type2))
                    ) {
                        return false;
                    }
                }
                return true;
            });

            const hasPKRS = App.game.keyItems.hasKeyItem(KeyItemType.Pokerus_virus);
            const starterName = GameConstants.Starter[player.starter()];
            const starterPKMN = PartyController.getSortedList().filter(p => p.name == starterName)[0];
            const virusReady = PartyController.getSortedList().filter(e => e._level() == 100 && e.breeding == false && e.pokerus == false);
            if (pkrsState && hasPKRS && virusReady.length != 0) {
                if (starterPKMN._level() == 100 && !starterPKMN.breeding) {
                    App.game.breeding.addPokemonToHatchery(starterPKMN);
                    return true;
                } else if (starterPKMN._level() == 100 && starterPKMN.breeding) {
                    App.game.breeding.addPokemonToHatchery(virusReady[0]);
                    return true;
                }
                if (pkrsStrict) {
                    return true;
                } else {
                    basicHatchery();
                }
            } else {
                basicHatchery();
            }

            function basicHatchery() {
                try {
                    App.game.breeding.addPokemonToHatchery(filteredEggList[0]);
                } catch (err) {
                    const canBreed = PartyController.getSortedList().filter(e => e._level() == 100 && e.breeding == false);
                    const randBreed = getRandomInt(canBreed.length);
                    App.game.breeding.addPokemonToHatchery(canBreed[randBreed]);
                }
            }

        }
    }, 50); // Runs every game tick
}

if (!validParse(localStorage.getItem('autoHatchState'))) {
    localStorage.setItem("autoHatchState", false);
}
if (!validParse(localStorage.getItem('autoEgg'))) {
    localStorage.setItem("autoEgg", false);
}
if (!validParse(localStorage.getItem('autoFossil'))) {
    localStorage.setItem("autoFossil", false);
}
if (!validParse(localStorage.getItem('shinyFossil'))) {
    localStorage.setItem("shinyFossil", false);
}
if (!validParse(localStorage.getItem('hatcherySortVal'))) {
    localStorage.setItem("hatcherySortVal", 0);
}
if (!validParse(localStorage.getItem('hatcherySortDir'))) {
    localStorage.setItem("hatcherySortDir", true);
}
if (!validParse(localStorage.getItem('hatcherySortSync'))) {
    localStorage.setItem("hatcherySortSync", false);
}
if (!validParse(localStorage.getItem('pokerusModeState'))) {
    localStorage.setItem("pokerusModeState", false);
}
if (!validParse(localStorage.getItem('pokerusModeStrict'))) {
    localStorage.setItem("pokerusModeStrict", false);
}
hatchState = JSON.parse(localStorage.getItem('autoHatchState'));
eggState = JSON.parse(localStorage.getItem('autoEgg'));
fossilState = JSON.parse(localStorage.getItem('autoFossil'));
shinyFossilState = JSON.parse(localStorage.getItem('shinyFossil'));
hatcherySortVal = JSON.parse(localStorage.getItem('hatcherySortVal'));
hatcherySortDir = JSON.parse(localStorage.getItem('hatcherySortDir'));
hatcherySortSync = JSON.parse(localStorage.getItem('hatcherySortSync'));
pkrsState = JSON.parse(localStorage.getItem('pokerusModeState'));
pkrsStrict = JSON.parse(localStorage.getItem('pokerusModeStrict'));

function loadScript() {
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function () {
        var result = oldInit.apply(this, arguments)
        initAutoHatch()
        return result
    }
}

var scriptName = 'enhancedautohatchery'

if (document.getElementById('scriptHandler') != undefined) {
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) != null) {
        if (localStorage.getItem(scriptName) == 'true') {
            loadScript()
        }
    }
    else {
        localStorage.setItem(scriptName, 'true')
        loadScript()
    }
}
else {
    loadScript();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function validParse(key) {
    try {
        if (key === null) {
            throw new Error;
        }
        JSON.parse(key);
        return true;
    } catch (e) {
        return false;
    }
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
