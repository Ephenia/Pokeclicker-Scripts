// ==UserScript==
// @name         [Pokeclicker] Enhanced Auto Hatchery
// @namespace    Pokeclicker Scripts
// @match        https://www.pokeclicker.com/
// @grant        none
// @version      1.7
// @author       Ephenia (Original/Credit: Drak + Ivan Lay)
// @description  Automatically hatches eggs at 100% completion. Adds an On/Off button for auto hatching as well as an option for automatically hatching store bought eggs and dug up fossils.
// @updateURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautohatchery.user.js
// ==/UserScript==

var hatchState;
var awaitAutoHatch;
var autoHatchLoop;
var randFossilEgg;
var eggState;
var fossilState;
var hatcherySortVal;
var hatcherySortDir;
var hatcherySortSync;

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
    </button>`

    document.getElementById('auto-hatch-start').addEventListener('click', event => { toggleAutoHatch(event); });
    document.getElementById('sort-sync').addEventListener('click', event => { changesortsync(event); });
    document.getElementById('auto-egg').addEventListener('click', event => { toggleEgg(event); });
    document.getElementById('auto-fossil').addEventListener('click', event => { toggleFossil(event); });

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
    localStorage.setItem('auto-fossil', fossilState);
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

            if (fossilState) {
                var randFossilIndex;
                var storedFossilName = [];
                var storedFossilID = [];
                const treasureLength = player.mineInventory().length;
                for (var e = 0; e < treasureLength; e++) {
                    const valueType = player.mineInventory()[e].valueType
                    const itemAmount = player.mineInventory()[e].amount()
                    if (valueType == "Mine Egg" && itemAmount > 0) {
                        const fossilName = player.mineInventory()[e].name;
                        const fossilID = player.mineInventory()[e].id;
                        const fossilePoke = GameConstants.FossilToPokemon[fossilName];
                        const pokeRegion = PokemonHelper.calcNativeRegion(fossilePoke)
                        if (pokeRegion <= player.highestRegion()) {
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
            let filteredEggList = PartyController.getSortedList().filter(
                (partyPokemon) => {
                    // Only breedable Pokemon
                    if (partyPokemon.breeding || partyPokemon.level < 100) {
                        return false;
                    }
                    // Check based on category
                    if (BreedingFilters.category.value() >= 0) {
                        if (
                            partyPokemon.category !== BreedingFilters.category.value()
                        ) {
                            return false;
                        }
                    }
                    // Check based on shiny status
                    if (BreedingFilters.shinyStatus.value() >= 0) {
                        if (
                            +partyPokemon.shiny !== BreedingFilters.shinyStatus.value()
                        ) {
                            return false;
                        }
                    }
                    // Check based on native region
                    if (BreedingFilters.region.value() > -2) {
                        if (
                            PokemonHelper.calcNativeRegion(partyPokemon.name) !==
                            BreedingFilters.region.value()
                        ) {
                            return false;
                        }
                    }
                    // Check if either of the types match
                    const type1 =
                          BreedingFilters.type1.value() > -2
                    ? BreedingFilters.type1.value()
                    : null;
                    const type2 =
                          BreedingFilters.type2.value() > -2
                    ? BreedingFilters.type2.value()
                    : null;
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
                }
            );

            try {
                App.game.breeding.addPokemonToHatchery(filteredEggList[0]);
            } catch (err) {
                const isFavorite = BreedingFilters.category.value();
                if (isFavorite != 1) {
                    const canBreed = PartyController.getSortedList().filter(e => e._level() == 100 && e.breeding == false);
                    const randBreed = getRandomInt(canBreed.length);
                    App.game.breeding.addPokemonToHatchery(canBreed[randBreed]);
                } else {
                    return true;
                }
            }
        }
    }, 50); // Runs every game tick
}

const updateCheckHatch = JSON.parse(localStorage.getItem('autoHatchUpdate'));
if (!updateCheckHatch || updateCheckHatch != 1.7) {
    localStorage.setItem("autoHatchState", false);
    localStorage.setItem("autoEgg", false);
    localStorage.setItem("autoFossil", false);
    localStorage.setItem("hatcherySortSync", false);
    localStorage.setItem("autoHatchUpdate", 1.7);
}
if (!localStorage.getItem('autoHatchState')) {
    localStorage.setItem("autoHatchState", false);
}
if (!localStorage.getItem('autoEgg') == null) {
    localStorage.setItem("autoEgg", false);
}
if (!localStorage.getItem('autoFossil') == null) {
    localStorage.setItem("autoFossil", false);
}
if (!localStorage.getItem('hatcherySortVal') == null) {
    localStorage.setItem("hatcherySortVal", 0);
}
if (!localStorage.getItem('hatcherySortDir') == null) {
    localStorage.setItem("hatcherySortDir", true);
}
if (!localStorage.getItem('hatcherySortSync') == null) {
    localStorage.setItem("hatcherySortSync", false);
}
hatchState = JSON.parse(localStorage.getItem('autoHatchState'));
eggState = JSON.parse(localStorage.getItem('autoEgg'));
fossilState = JSON.parse(localStorage.getItem('autoFossil'));
hatcherySortVal = JSON.parse(localStorage.getItem('hatcherySortVal'));
hatcherySortDir = JSON.parse(localStorage.getItem('hatcherySortDir'));
hatcherySortSync = JSON.parse(localStorage.getItem('hatcherySortSync'));

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initAutoHatch()
        return result
    }
}

var scriptName = 'enhancedautohatchery'

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

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
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
