// ==UserScript==
// @name         [Pokeclicker] Enhanced Auto Hatchery
// @namespace    Pokeclicker Scripts
// @match        https://www.pokeclicker.com/
// @grant        none
// @version      1.1
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
                        storedFossilName.push(fossilName)
                        storedFossilID.push(fossilID)
                        //console.log(player.mineInventory()[i].name)
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
            try {
                PartyController.getHatcherySortedList()[0].name;
            } catch (err) {
                var filterOpts = document.getElementById('breedingModal').querySelectorAll('select');
                filterOpts[2].setAttribute("style", "background-color: #f04124;");
                filterOpts[3].setAttribute("style", "background-color: #f04124;");
                filterOpts[4].setAttribute("style", "background-color: #f04124;");
                filterOpts[5].setAttribute("style", "background-color: #f04124;");
                BreedingController.openBreedingModal();
                addGlobalStyle('#breedingModal { display: none !important; }');
                setTimeout(function(){
                    $('#breedingModal').modal('hide');
                    document.querySelector('head').querySelectorAll('style:last-child')[0].remove();
                }, 1000);
            }
            var filteredEggList = PartyController.getHatcherySortedList();
            var fp;
            for (var fe = 0; fe < filteredEggList.length; fe++) {
                if (filteredEggList[fe]._level() != 100) {
                    //console.log(filteredEggList[fe].name)
                    //console.log(filteredEggList[fe]._level())
                } else if (filteredEggList[fe]._breeding() == true) {
                    //console.log(filteredEggList[fe].name)
                    //console.log(filteredEggList[fe]._level())
                }
                else {
                    fp = fe;
                }
                if (fp == fe) {
                    //console.log("adding"+filteredEggList[fp].name)
                    App.game.breeding.addPokemonToHatchery(filteredEggList[fp]);
                    return true;
                }
            }
        }
    }, 50); // Runs every game tick
}

if (localStorage.getItem('autoHatchState') == null) {
    localStorage.setItem("autoHatchState", "OFF");
}
if (localStorage.getItem('autoEggFossil') == null) {
    localStorage.setItem("autoEggFossil", "OFF");
}
hatchState = localStorage.getItem('autoHatchState');
eggFossilState = localStorage.getItem('autoEggFossil');

for (var i = 0; i < trainerCards.length; i++) {
    trainerCards[i].addEventListener('click', checkAutoHatch, false);
}

function checkAutoHatch() {
    awaitAutoHatch = setInterval(function () {
        var breedingAccess = App.game.breeding.canAccess();
        if (typeof breedingAccess === 'undefined') {
            console.log("Auto hatchery isn't available yet.");
        } else {
            clearInterval(awaitAutoHatch)
            if (breedingAccess == true) {
                initAutoHatch();
                clearInterval(awaitAutoHatch)
            }
            if (breedingAccess == false) {
                clearInterval(awaitAutoHatch)
            }
        }
    }, 1000);
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
