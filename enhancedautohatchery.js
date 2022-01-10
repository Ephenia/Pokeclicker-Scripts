// ==UserScript==
// @name         [Pokeclicker] Enhanced Auto Hatchery
// @namespace    Pokeclicker Scripts
// @match        https://www.pokeclicker.com/
// @grant        none
// @version      1.4
// @author       Ephenia (Original/Credit: Drak + Ivan Lay)
// @description  Automatically hatches eggs at 100% completion. Adds an On/Off button for auto hatching as well as an option for automatically hatching store bought eggs and dug up fossils.
// ==/UserScript==

var hatchState;
var awaitAutoHatch;
var hatchColor;
var autoHatchLoop;
var randFossilEgg;
var eggFossilState;
var eggFossilColor;
var hatcherySortVal;
var hatcherySortDir;
var newSave = document.querySelectorAll('label')[0];
var trainerCards = document.querySelectorAll('.trainer-card');
var breedingDisplay = document.getElementById('breedingDisplay');

function initAutoHatch() {
    if (hatchState == "OFF") {
        hatchColor = "danger"
    } else {
        hatchColor = "success"
    }
    if (eggFossilState == "OFF") {
        eggFossilColor = "danger"
    } else {
        eggFossilColor = "success"
    }

    breedingDisplay.querySelector('.card-header').outerHTML += `<button id= "auto-hatch-start" class="btn btn-sm btn-`+hatchColor+`" style="position: absolute;left: 0px;top: 0px;width: 65px;height: 41px;font-size: 7pt;">
    Auto Hatch [`+hatchState+`]
    </button>`

    document.getElementById('breedingModal').querySelector('.modal-header').querySelectorAll('button')[1].outerHTML += `<button id="auto-egg-fossil" class="btn btn-`+eggFossilColor+`" style="margin-left:25px;">
    Auto Egg/Fossil [`+eggFossilState+`]
    </button>`

    $("#auto-hatch-start").click (toggleAutoHatch)
    $("#auto-egg-fossil").click (toggleEggFossil)
    //document.getElementById('breedingModal').querySelector('button[aria-controls="breeding-sort"]').setAttribute("style", "display:none");

    if (hatchState == "ON") {
        autoHatcher();
    }
}

function toggleAutoHatch() {
    if (hatchState == "OFF") {
        hatchState = "ON"
        localStorage.setItem("autoHatchState", hatchState);
        document.getElementById("auto-hatch-start").classList.remove('btn-danger');
        document.getElementById("auto-hatch-start").classList.add('btn-success');
        autoHatcher();
    } else {
        hatchState = "OFF"
        localStorage.setItem("autoHatchState", hatchState);
        document.getElementById("auto-hatch-start").classList.remove('btn-success');
        document.getElementById("auto-hatch-start").classList.add('btn-danger');
        clearInterval(autoHatchLoop)
    }
    document.getElementById('auto-hatch-start').innerHTML = `Auto Hatch [`+hatchState+`]<br>`
}

function toggleEggFossil() {
    if (eggFossilState == "OFF") {
        eggFossilState = "ON"
        localStorage.setItem("autoEggFossil", eggFossilState);
        document.getElementById("auto-egg-fossil").classList.remove('btn-danger');
        document.getElementById("auto-egg-fossil").classList.add('btn-success');
    } else {
        eggFossilState = "OFF"
        localStorage.setItem("autoEggFossil", eggFossilState);
        document.getElementById("auto-egg-fossil").classList.remove('btn-success');
        document.getElementById("auto-egg-fossil").classList.add('btn-danger');
    }
    document.getElementById('auto-egg-fossil').innerHTML = `Auto Egg/Fossil [`+eggFossilState+`]`
}

function autoHatcher() {
    autoHatchLoop = setInterval(function () {
        //change daycare sorting
        var pS = Settings.getSetting('partySort');
        var hS = Settings.getSetting('hatcherySort');
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

        var pSD = Settings.getSetting('partySortDirection');
        var hSD = Settings.getSetting('hatcherySortDirection');
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

        // Attempt to hatch each egg. If the egg is at 100% it will succeed
        [0, 1, 2, 3].forEach((index) => App.game.breeding.hatchPokemonEgg(index));

        // Now add eggs to empty slots if we can
        while (
            App.game.breeding.canAccess() == true && // Can access the Hatchery
            App.game.party.hasMaxLevelPokemon() && // Don't run if you don't have any level 100 Pokemon
            App.game.breeding.hasFreeEggSlot() // Has an open egg slot
        ) {

            if (eggFossilState == "ON") {
                var hasEgg;
                var randEggIndex;
                var storedEggName = [];
                var eggTypesLength = GameConstants.EggItemType[0].length;
                var eggTypes = GameConstants.EggItemType;
                for (var i = 0; i < eggTypesLength; i++) {
                    var selEgg = eggTypes[i]
                    if (player._itemList[selEgg]() > 0) {
                        storedEggName.push(selEgg)
                        //console.log(selEgg+"'s value would be "+player._itemList[selEgg]())
                    }
                }
                //console.log(storedEggName)
                if (storedEggName.length != 0) {
                    randEggIndex = ((Math.floor(Math.random() * storedEggName.length) + 1) - 1)
                    //console.log(storedEggName[randEggIndex])
                    hasEgg = true;
                } else {
                    hasEgg = false
                }

                var hasFossil;
                var randFossilIndex;
                var storedFossilName = [];
                var storedFossilID = [];
                var treasureLength = player.mineInventory().length;
                for (var i = 0; i < treasureLength; i++) {
                    var valueType = player.mineInventory()[i].valueType
                    var itemAmount = player.mineInventory()[i].amount()
                    if (valueType == "Mine Egg" && itemAmount > 0) {
                        var fossilName = player.mineInventory()[i].name;
                        var fossilID = player.mineInventory()[i].id;
                        var fossilePoke = GameConstants.FossilToPokemon[fossilName];
                        var pokeRegion = PokemonHelper.calcNativeRegion(fossilePoke)
                        if (pokeRegion <= player.highestRegion()) {
                            storedFossilName.push(fossilName)
                            storedFossilID.push(fossilID)
                            //console.log(player.mineInventory()[i].name)
                        } else {
                            //console.log(fossilePoke+" of region "+pokeRegion+ " will be ignored.")
                        }
                    }
                }
                //console.log(storedFossilID)
                if (storedFossilID.length != 0) {
                    randFossilIndex = ((Math.floor(Math.random() * storedFossilID.length) + 1) - 1)
                    //console.log("("+storedFossilID[randFossilIndex]+") "+storedFossilName[randFossilIndex])
                    hasFossil = true;
                } else {
                    hasFossil = false;
                }

                if (hasEgg == true && hasFossil == true) {
                    //console.log("user has both egg and fossil")
                    var isEggFossil = (Math.floor(Math.random() * 2) + 1)
                    if (isEggFossil == 1) {
                        ItemList[storedEggName[randEggIndex]].use()
                        //console.log(storedEggName[randEggIndex]+" has been used!")
                        return true;
                    } else {
                        Underground.sellMineItem(storedFossilID[randFossilIndex])
                        //console.log(storedFossilName[randFossilIndex]+" has been used!")
                        return true;
                    }
                }else if (hasEgg == true) {
                    //console.log("user has only egg")
                    ItemList[storedEggName[randEggIndex]].use()
                    //console.log(storedEggName[randEggIndex]+" has been used!")
                    return true;
                }else if (hasFossil == true) {
                    //console.log("user has only fossil")
                    Underground.sellMineItem(+storedFossilID[randFossilIndex])
                    //console.log(storedFossilName[randFossilIndex]+" has been used!")
                    return true;
                } else {
                    //console.log("user has no egg or fossil")
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
                    if (BreedingController.filter.category() >= 0) {
                        if (
                            partyPokemon.category !== BreedingController.filter.category()
                        ) {
                            return false;
                        }
                    }
                    // Check based on shiny status
                    if (BreedingController.filter.shinyStatus() >= 0) {
                        if (
                            +partyPokemon.shiny !== BreedingController.filter.shinyStatus()
                        ) {
                            return false;
                        }
                    }
                    // Check based on native region
                    if (BreedingController.filter.region() > -2) {
                        if (
                            PokemonHelper.calcNativeRegion(partyPokemon.name) !==
                            BreedingController.filter.region()
                        ) {
                            return false;
                        }
                    }
                    // Check if either of the types match
                    const type1 =
                          BreedingController.filter.type1() > -2
                    ? BreedingController.filter.type1()
                    : null;
                    const type2 =
                          BreedingController.filter.type2() > -2
                    ? BreedingController.filter.type2()
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
                //console.log(filteredEggList[0])
                App.game.breeding.addPokemonToHatchery(filteredEggList[0]);
            } catch (err) {
                var canBreed = PartyController.getSortedList().filter(e => e._level() == 100 && e.breeding == false);
                var randBreed = getRandomInt(canBreed.length);
                //console.log(canBreed[randBreed])
                App.game.breeding.addPokemonToHatchery(canBreed[randBreed]);
            }
            //console.log("Added " + filteredEggList[0].name + " to the Hatchery!");
        }
    }, 50); // Runs every game tick
}

if (localStorage.getItem('autoHatchState') == null) {
    localStorage.setItem("autoHatchState", "OFF");
}
if (localStorage.getItem('autoEggFossil') == null) {
    localStorage.setItem("autoEggFossil", "OFF");
}
if (localStorage.getItem('hatcherySortVal') == null) {
    localStorage.setItem("hatcherySortVal", 0);
}
if (localStorage.getItem('hatcherySortDir') == null) {
    localStorage.setItem("hatcherySortDir", true);
}
hatchState = localStorage.getItem('autoHatchState');
eggFossilState = localStorage.getItem('autoEggFossil');
hatcherySortVal = +localStorage.getItem('hatcherySortVal');
hatcherySortDir = +localStorage.getItem('hatcherySortDir');

for (var i = 0; i < trainerCards.length; i++) {
    trainerCards[i].addEventListener('click', checkAutoHatch, false);
}
newSave.addEventListener('click', checkAutoHatch, false);

function checkAutoHatch() {
    awaitAutoHatch = setInterval(function () {
        var breedingAccess;
        try {
            breedingAccess = App.game.breeding.canAccess();
        } catch(err) {}
        if (typeof breedingAccess != 'undefined') {
            if (breedingAccess == true) {
                initAutoHatch();
                clearInterval(awaitAutoHatch)
            } else {
                //console.log("Checking for access...")
            }
        }
    }, 1000);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
