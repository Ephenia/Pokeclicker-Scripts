// ==UserScript==
// @name          [Pokeclicker] Simple Auto Farmer
// @namespace     Pokeclicker Scripts
// @author        Ephenia / Akwawa / perkasthor / davide-lugli (update 1.6)
// @description   It Add buttons to automatically plant any specific berry, harvest, mulch or replant all berries. Make sure to have the berry selected that you want to auto plant & harvest before enabling it. This includes an auto Mulcher as well.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.6

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/simpleautofarmer.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/simpleautofarmer.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==//

function initAutoFarm() {
    var plantState;
    var plantColor;
    var autoPlantTimer;

    var harvestState;
    var harvestColor;
    var autoHarvestTimer;

    var replantState;
    var replantColor;
    var autoReplantTimer;

    var mulchState;
    var mulchColor;
    var autoMulchTimer;

    var shovelList = document.getElementById('shovelList');
    var colorOn = "success";
    var colorOff = "danger";

    plantState = localStorage.getItem('autoPlantState');
    harvestState = localStorage.getItem('autoHarvestState');
    replantState = localStorage.getItem('autoReplantState');
    mulchState = localStorage.getItem('autoMulchState');

    createMenu();
    autoPlant(document.getElementById('auto-plant-start'), true);
    autoHarvest(document.getElementById('auto-harvest-start'), true);
    autoReplant(document.getElementById('auto-replant-start'), true);
    autoMulch(document.getElementById('auto-mulch-start'), true);

    function createMenu() {
        plantColor = (plantState === "OFF") ? colorOff : colorOn ;
        harvestColor = (harvestState === "OFF") ? colorOff : colorOn ;
        replantColor = (replantState === "OFF") ? colorOff : colorOn ;
        mulchColor = (mulchState === "OFF") ? colorOff : colorOn ;

        var elemAF = document.createElement("div");
        var divMenu1 = document.createElement("div");
        var divMenu2 = document.createElement("div");
        var divBoutonAutoPlant = document.createElement("div");
        var divBoutonAutoHarvest = document.createElement("div");
        var divBoutonAutoReplant = document.createElement("div");
        var divBoutonAutoMulch = document.createElement("div");
        var buttonAutoPlant = document.createElement("bouton");
        var buttonAutoHarvest = document.createElement("bouton");
        var buttonAutoReplant = document.createElement("bouton");
        var buttonAutoMulch = document.createElement("bouton");

        divMenu1.className = "row justify-content-center py-0";
        divMenu2.className = "row justify-content-center py-0";
        divBoutonAutoPlant.className = "col-6 pr-0";
        divBoutonAutoHarvest.className = "col-6 pl-0";
		divBoutonAutoReplant.className = "col-6 pr-0";
        divBoutonAutoMulch.className = "col-6 pl-0";

        buttonAutoPlant.style.height = "50px";
        buttonAutoHarvest.style.height = "50px";
		buttonAutoReplant.style.height = "50px";
        buttonAutoMulch.style.height = "50px";

        buttonAutoPlant.style.fontSize = "9pt";
        buttonAutoPlant.className = "btn btn-block btn-" + plantColor;
        buttonAutoPlant.setAttribute("id", "auto-plant-start");
        buttonAutoPlant.textContent = " Auto Plant\n[" + plantState + "]";
        buttonAutoPlant.onclick = function() { autoPlant(this); };

        buttonAutoHarvest.style.fontSize = "9pt";
        buttonAutoHarvest.className = "btn btn-block btn-" + harvestColor;
        buttonAutoHarvest.setAttribute("id", "auto-harvest-start");
        buttonAutoHarvest.textContent = " Auto Harvest\n[" + harvestState + "]";
        buttonAutoHarvest.onclick = function() { autoHarvest(this); };

        buttonAutoReplant.style.fontSize = "9pt";
        buttonAutoReplant.className = "btn btn-block btn-" + harvestColor;
        buttonAutoReplant.setAttribute("id", "auto-replant-start");
        buttonAutoReplant.textContent = " Auto Replant\n[" + harvestState + "]";
        buttonAutoReplant.onclick = function() { autoReplant(this); };

        buttonAutoMulch.style.fontSize = "9pt";
        buttonAutoMulch.className = "btn btn-block btn-" + mulchColor;
        buttonAutoMulch.setAttribute("id", "auto-mulch-start");
        buttonAutoMulch.textContent = " Auto Mulch\n[" + mulchState + "]";
        buttonAutoMulch.onclick = function() { autoMulch(this); };

        divBoutonAutoPlant.appendChild(buttonAutoPlant);
        divBoutonAutoHarvest.appendChild(buttonAutoHarvest);
        divBoutonAutoReplant.appendChild(buttonAutoReplant);
        divBoutonAutoMulch.appendChild(buttonAutoMulch);
        divMenu1.appendChild(divBoutonAutoPlant);
        divMenu1.appendChild(divBoutonAutoHarvest);
        divMenu2.appendChild(divBoutonAutoReplant);
        divMenu2.appendChild(divBoutonAutoMulch);
        elemAF.appendChild(divMenu1);
        elemAF.appendChild(divMenu2);

        shovelList.before(elemAF);
    }

    // Plant - cmd, start, stop, do
    function autoPlant(elt, init=false) {
        if ( replantState === "ON" ) {
            return;
        }

        if ( (init === true && plantState === "ON" ) || (init === false && plantState === "OFF") ) {
            startPlant(elt);
        } else {
            stopPlant(elt);
        }
    }

    function startPlant(elt) {
        localStorage.setItem("autoPlantState", "ON");
        plantState = "ON";
        autoPlantTimer = setInterval(function () {
            doPlant();
        }, 1000); // Happens every 1 second
        elt.innerText = "Auto Plant\n[" + plantState + "]";
        elt.classList.remove('btn-danger');
        elt.classList.add('btn-success');
    }

    function stopPlant(elt) {
        localStorage.setItem("autoPlantState", "OFF");
        plantState = "OFF";
        elt.innerText = "Auto Plant\n[" + plantState + "]";
        elt.classList.remove('btn-success');
        elt.classList.add('btn-danger');
        clearInterval(autoPlantTimer);
    }

    function doPlant() {
        if ( replantState === "OFF" ) {
            App.game.farming.plantAll(FarmController.selectedBerry());
        }
    }

    // Harvest - cmd, start, stop, do
    function autoHarvest(elt, init=false) {
        if ( replantState === "ON" ) {
            return;
        }

        if ( (init === true && harvestState === "ON" ) || (init === false && harvestState == "OFF") ) {
            startHarvest(elt);
        } else {
            stopHarvest(elt);
        }
    }

    function startHarvest(elt) {
        localStorage.setItem("autoHarvestState", "ON");
        harvestState = "ON";
        autoHarvestTimer = setInterval(function () {
            doHarvest();
        }, 1000); // Happens every 1 second
        elt.innerText = "Auto Harvest\n[" + harvestState + "]";
        elt.classList.remove('btn-danger');
        elt.classList.add('btn-success');
    }

    function stopHarvest(elt) {
        localStorage.setItem("autoHarvestState", "OFF");
        harvestState = "OFF";
        elt.innerText = "Auto Harvest\n[" + harvestState + "]";
        elt.classList.remove('btn-success');
        elt.classList.add('btn-danger');
        clearInterval(autoHarvestTimer);
    }

    function doHarvest() {
        if ( replantState === "OFF" ) {
            App.game.farming.harvestAll();
        }
    }

    // Replant - cmd, start, stop, do
    function autoReplant(elt, init=false) {
        if ( plantState === "ON" || harvestState === "ON" || mulchState === "ON" ) {
            return;
        }

        if ( (init === true && replantState === "ON" ) || (init === false && replantState == "OFF") ) {
            startReplant(elt);
        } else {
            stopReplant(elt);
        }
    }

    function startReplant(elt) {
        localStorage.setItem("autoReplantState", "ON");
        replantState = "ON";
        autoReplantTimer = setInterval(function () {
            doReplant();
        }, 1000); // Happens every 1 second
        elt.innerText = "Auto Replant\n[" + replantState + "]";
        elt.classList.remove('btn-danger');
        elt.classList.add('btn-success');
    }

    function stopReplant(elt) {
        localStorage.setItem("autoReplantState", "OFF");
        replantState = "OFF";
        elt.innerText = "Auto Replant\n[" + replantState + "]";
        elt.classList.remove('btn-success');
        elt.classList.add('btn-danger');
        clearInterval(autoReplantTimer);
    }

    function doReplant() {
        // Check each tile
        for (let i = 0; i < 25; i++) {
            var berry = App.game.farming.plotList[i].berry;
            if (berry >= 0) {
                var age = App.game.farming.plotList[i].age;
                var growthTime = App.game.farming.berryData[berry].growthTime[App.game.farming.berryData[berry].growthTime.length - 1];
                if (growthTime - age < 10) {
                    if (!App.game.farming.plotList[0].isSafeLocked && App.game.farming.plotList[0].isUnlocked) {
                        App.game.farming.harvest(i, false);
                        App.game.farming.plant(i, berry, false);
                    }
                }
            }
        }
    }

    // Mulch - cmd, start, stop, do
    function autoMulch(elt, init=false) {
        if ( replantState === "ON" ) {
            return;
        }

        if ( (init === true && mulchState === "ON" ) || (init === false && mulchState == "OFF") ) {
            startMulch(elt);
        } else {
            stopMulch(elt);
        }
    }

    function startMulch(elt) {
        localStorage.setItem("autoMulchState", "ON");
        mulchState = "ON";
        autoMulchTimer = setInterval(function () {
            doMulch();
        }, 1000); // Happens every 1 second
        elt.innerText = "Auto Mulch\n[" + mulchState + "]";
        elt.classList.remove('btn-danger');
        elt.classList.add('btn-success');
    }

    function stopMulch(elt) {
        localStorage.setItem("autoMulchState", "OFF");
        mulchState = "OFF";
        elt.innerText = "Auto Mulch\n[" + mulchState + "]";
        elt.classList.remove('btn-success');
        elt.classList.add('btn-danger');
        clearInterval(autoMulchTimer);
    }

    function doMulch() {
        FarmController.mulchAll();
    }
}

function loadScript() {
    var oldInit = Preload.hideSplashScreen;

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments);
        initAutoFarm();
        return result;
    }
}

function initLocalStorage(param, value) {
    if (localStorage.getItem(param) == null) {
        localStorage.setItem(param, value);
    }
}

initLocalStorage("autoPlantState", "OFF");
initLocalStorage("autoHarvestState", "OFF");
initLocalStorage("autoReplantState", "OFF");
initLocalStorage("autoMulchState", "OFF");

var scriptName = 'simpleautofarmer';

if ( document.getElementById('scriptHandler') != undefined ) {
    var scriptElement = document.createElement('div');
    scriptElement.id = scriptName;
    document.getElementById('scriptHandler').appendChild(scriptElement);
    if ( localStorage.getItem(scriptName) != null ) {
        if ( localStorage.getItem(scriptName) == 'true' ) {
            loadScript();
        }
    } else {
        localStorage.setItem(scriptName, 'true');
        loadScript();
    }
} else {
    loadScript();
}
