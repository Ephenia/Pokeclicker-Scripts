// ==UserScript==
// @name         [Pokeclicker] Enhanced Auto Hatchery
// @namespace    Pokeclicker Scripts
// @match        https://www.pokeclicker.com/
// @grant        none
// @version      1.5
// @author       Ephenia (Original/Credit: Drak + Ivan Lay)
// @description  Automatically hatches eggs at 100% completion. Adds an On/Off button for auto hatching as well as an option for automatically hatching store bought eggs and dug up fossils.
// ==/UserScript==

var hatchState;
var awaitAutoHatch;
var hatchColor;
var autoHatchLoop;
var randFossilEgg;
var eggState;
var eggColor;
var fossilState;
var fossilColor;
var shinyFossilState;
var shinyFossilColor;
var hatcherySortVal;
var hatcherySortDir;
var hatcherySortSync;
var sortSyncColor;
var newSave;
var trainerCards;
var breedingDisplay = document.getElementById('breedingDisplay');

function initAutoHatch() {
    if (hatchState == "OFF") {
        hatchColor = "danger"
    } else {
        hatchColor = "success"
    }
    if (eggState == "OFF") {
        eggColor = "danger"
    } else {
        eggColor = "success"
    }
    if (fossilState == "OFF") {
        fossilColor = "danger"
    } else {
        fossilColor = "success"
    }
    if (shinyFossilState == "OFF") {
        shinyFossilColor = "danger"
    } else {
        shinyFossilColor = "success"
    }
    if (hatcherySortSync == "OFF") {
        sortSyncColor = "danger"
    } else {
        sortSyncColor = "success"
    }

    breedingDisplay.querySelector('.card-header').outerHTML += `<button id= "auto-hatch-start" class="btn btn-sm btn-` + hatchColor + `" style="position: absolute;left: 0px;top: 0px;width: 65px;height: 41px;font-size: 7pt;">
    Auto Hatch [`+ hatchState + `]
    </button>`

    document.getElementById('breedingModal').querySelector('.modal-header').querySelectorAll('button')[1].outerHTML += `<button id="sort-sync" class="btn btn-` + sortSyncColor + `" style="margin-left:10px;">
    Pokemon List Sync [`+ hatcherySortSync + `]
    </button>
    <button id="auto-egg" class="btn btn-`+ eggColor + `" style="margin-left:10px;">
    Auto Egg [`+ eggState + `]
    </button>
    <button id="auto-fossil" class="btn btn-`+ fossilColor + `" style="margin-left:10px;">
    Auto Fossil [`+ fossilState + `]
    </button>
    <button id="shiny-fossil" class="btn btn-`+ shinyFossilColor + `" style="margin-left:10px;">
    Ignore Shiny Fossils [`+ shinyFossilState + `]
    </button>`

    $("#auto-hatch-start").click(toggleAutoHatch)
    $("#sort-sync").click(changesortsync)
    $("#auto-egg").click(toggleEgg)
    $("#auto-fossil").click(toggleFossil)
    $("#shiny-fossil").click(toggleShinyFossil)
    //document.getElementById('breedingModal').querySelector('button[aria-controls="breeding-sort"]').setAttribute("style", "display:none");
    addGlobalStyle('.eggSlot.disabled { pointer-events: unset !important; }');

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
    document.getElementById('auto-hatch-start').innerHTML = `Auto Hatch [` + hatchState + `]<br>`
}

function changesortsync() {
    if (hatcherySortSync == "OFF") {
        hatcherySortSync = "ON"
        localStorage.setItem("hatcherySortSync", hatcherySortSync);
        document.getElementById("sort-sync").classList.remove('btn-danger');
        document.getElementById("sort-sync").classList.add('btn-success');
    } else {
        hatcherySortSync = "OFF"
        localStorage.setItem("hatcherySortSync", hatcherySortSync);
        document.getElementById("sort-sync").classList.remove('btn-success');
        document.getElementById("sort-sync").classList.add('btn-danger');
    }
    document.getElementById('sort-sync').innerHTML = `Pokemon List Sync [` + hatcherySortSync + `]`
}

function toggleEgg() {
    if (eggState == "OFF") {
        eggState = "ON"
        localStorage.setItem("autoEgg", eggState);
        document.getElementById("auto-egg").classList.remove('btn-danger');
        document.getElementById("auto-egg").classList.add('btn-success');
    } else {
        eggState = "OFF"
        localStorage.setItem("autoEgg", eggState);
        document.getElementById("auto-egg").classList.remove('btn-success');
        document.getElementById("auto-egg").classList.add('btn-danger');
    }
    document.getElementById('auto-egg').innerHTML = `Auto Egg [` + eggState + `]`
}

function toggleFossil() {
    if (fossilState == "OFF") {
        fossilState = "ON"
        localStorage.setItem("autoFossil", fossilState);
        document.getElementById("auto-fossil").classList.remove('btn-danger');
        document.getElementById("auto-fossil").classList.add('btn-success');
    } else {
        fossilState = "OFF"
        localStorage.setItem("autoFossil", fossilState);
        document.getElementById("auto-fossil").classList.remove('btn-success');
        document.getElementById("auto-fossil").classList.add('btn-danger');
    }
    document.getElementById('auto-fossil').innerHTML = `Auto Fossil [` + fossilState + `]`
}

function toggleShinyFossil() {
    if (shinyFossilState == "OFF") {
        shinyFossilState = "ON"
        localStorage.setItem("shinyFossil", shinyFossilState);
        document.getElementById("shiny-fossil").classList.remove('btn-danger');
        document.getElementById("shiny-fossil").classList.add('btn-success');
    } else {
        shinyFossilState = "OFF"
        localStorage.setItem("shinyFossil", shinyFossilState);
        document.getElementById("shiny-fossil").classList.remove('btn-success');
        document.getElementById("shiny-fossil").classList.add('btn-danger');
    }
    document.getElementById('shiny-fossil').innerHTML = `Ignore Shiny Fossils [` + shinyFossilState + `]`
}

function autoHatcher() {
    autoHatchLoop = setInterval(function () {
        //change daycare sorting
        if (hatcherySortSync == "ON") {
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
            if (eggState == "ON") {
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
            }

            if (fossilState == "ON") {
                var randFossilIndex;
                var storedFossilName = [];
                var storedFossilID = [];
                var treasureLength = player.mineInventory().length;
                for (var e = 0; e < treasureLength; e++) {
                    var valueType = player.mineInventory()[e].valueType
                    var itemAmount = player.mineInventory()[e].amount()
                    if (valueType == "Mine Egg" && itemAmount > 0) {
                        var fossilName = player.mineInventory()[e].name;
                        var fossilID = player.mineInventory()[e].id;
                        var fossilePoke = GameConstants.FossilToPokemon[fossilName];
                        // 0 = Not caught yet, 1 = Non-Shiny, 2 = Already Shiny
                        const checkShiny = PartyController.getCaughtStatusByName(fossilePoke);
                        var pokeRegion = PokemonHelper.calcNativeRegion(fossilePoke)
                        if (pokeRegion <= player.highestRegion() && (shinyFossilState == "ON" || checkShiny != 2)) {
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
            }

            if (eggState == "ON" || fossilState == "ON") {
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
                } else if (hasEgg == true) {
                    //console.log("user has only egg")
                    ItemList[storedEggName[randEggIndex]].use()
                    //console.log(storedEggName[randEggIndex]+" has been used!")
                    return true;
                } else if (hasFossil == true) {
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
                var isFavorite = BreedingController.filter.category();
                if (isFavorite != 1) {
                    var canBreed = PartyController.getSortedList().filter(e => e._level() == 100 && e.breeding == false);
                    var randBreed = getRandomInt(canBreed.length);
                    //console.log(canBreed[randBreed])
                    App.game.breeding.addPokemonToHatchery(canBreed[randBreed]);
                } else {
                    return true;
                }
            }
            //console.log("Added " + filteredEggList[0].name + " to the Hatchery!");
        }
    }, 50); // Runs every game tick
}

if (localStorage.getItem('autoHatchState') == null) {
    localStorage.setItem("autoHatchState", "OFF");
}
if (localStorage.getItem('autoEgg') == null) {
    localStorage.setItem("autoEgg", "OFF");
}
if (localStorage.getItem('autoFossil') == null) {
    localStorage.setItem("autoFossil", "OFF");
}
if (localStorage.getItem('shinyFossil') == null) {
    localStorage.setItem("shinyFossil", "OFF");
}
if (localStorage.getItem('hatcherySortVal') == null) {
    localStorage.setItem("hatcherySortVal", 0);
}
if (localStorage.getItem('hatcherySortDir') == null) {
    localStorage.setItem("hatcherySortDir", true);
}
if (localStorage.getItem('hatcherySortSync') == null) {
    localStorage.setItem("hatcherySortSync", "OFF");
}
hatchState = localStorage.getItem('autoHatchState');
eggState = localStorage.getItem('autoEgg');
fossilState = localStorage.getItem('autoFossil');
shinyFossilState = localStorage.getItem('shinyFossil');
hatcherySortVal = +localStorage.getItem('hatcherySortVal');
hatcherySortDir = +localStorage.getItem('hatcherySortDir');
hatcherySortSync = localStorage.getItem('hatcherySortSync');

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
