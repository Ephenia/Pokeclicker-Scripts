// ==UserScript==
// @name        [Pokeclicker] Simple Auto Farmer
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.5
// @author      Ephenia / Akwawa (update 1.5)
// @description It Add buttons to automatically plant any specific berry, harvest or mulch all berries. Make sure to have the berry selected that you want to auto plant & harvest before enabling it. This includes an auto Mulcher as well.
// ==/UserScript==

function initAutoFarm() {
    var plantState;
    var plantColor;
    var autoPlantTimer;
    var harvestState;
    var harvestColor;
    var autoHarvestTimer;
    var mulchState;
    var mulchColor;
    var autoMulchTimer;
    var shovelList = document.getElementById('shovelList');
    var colorOn = "success";
    var colorOff = "danger";

    plantState = localStorage.getItem('autoPlantState');
    harvestState = localStorage.getItem('autoHarvestState');
    mulchState = localStorage.getItem('autoMulchState');

    createMenu();
    autoPlant(document.getElementById('auto-plant-start'), true);
    autoHarvest(document.getElementById('auto-harvest-start'), true);
    autoMulch(document.getElementById('auto-mulch-start'), true);

    function createMenu() {
        plantColor = (plantState === "OFF") ? colorOff : colorOn ;
        harvestColor = (harvestState === "OFF") ? colorOff : colorOn ;
        mulchColor = (mulchState === "OFF") ? colorOff : colorOn ;

        var elemAF = document.createElement("div");
        var divMenu = document.createElement("div");
        var divBoutonAutoPlant = document.createElement("div");
        var divBoutonAutoHarvest = document.createElement("div");
        var divBoutonAutoMulch = document.createElement("div");
        var buttonAutoPlant = document.createElement("bouton");
        var buttonAutoHarvest = document.createElement("bouton");
        var buttonAutoMulch = document.createElement("bouton");

        divMenu.className = "row justify-content-center py-0";
        divBoutonAutoPlant.className = "col-4 pr-0";
        divBoutonAutoHarvest.className = "col-4 pr-0 pl-0";
        divBoutonAutoMulch.className = "col-4 pl-0";

        buttonAutoPlant.style.fontSize = "9pt";
        buttonAutoPlant.className = "btn btn-block btn-" + plantColor;
        buttonAutoPlant.setAttribute("id", "auto-plant-start");
        buttonAutoPlant.textContent = " Auto Plant [" + plantState + "]";
        buttonAutoPlant.onclick = function() { autoPlant(this); };

        buttonAutoHarvest.style.fontSize = "9pt";
        buttonAutoHarvest.className = "btn btn-block btn-" + harvestColor;
        buttonAutoHarvest.setAttribute("id", "auto-harvest-start");
        buttonAutoHarvest.textContent = " Auto Harvest [" + harvestState + "]";
        buttonAutoHarvest.onclick = function() { autoHarvest(this); };

        buttonAutoMulch.style.fontSize = "9pt";
        buttonAutoMulch.className = "btn btn-block btn-" + mulchColor;
        buttonAutoMulch.setAttribute("id", "auto-mulch-start");
        buttonAutoMulch.textContent = " Auto Mulch [" + mulchState + "]";
        buttonAutoMulch.onclick = function() { autoMulch(this); };

        divBoutonAutoPlant.appendChild(buttonAutoPlant);
        divBoutonAutoHarvest.appendChild(buttonAutoHarvest);
        divBoutonAutoMulch.appendChild(buttonAutoMulch);
        divMenu.appendChild(divBoutonAutoPlant);
        divMenu.appendChild(divBoutonAutoHarvest);
        divMenu.appendChild(divBoutonAutoMulch);
        elemAF.appendChild(divMenu);

        shovelList.before(elemAF);
    }

    // Plant - cmd, start, stop, do
    function autoPlant(elt, init=false) {
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
        elt.innerText = "Auto Plant [" + plantState + "]";
        elt.classList.remove('btn-danger');
        elt.classList.add('btn-success');
    }

    function stopPlant(elt) {
        localStorage.setItem("autoPlantState", "OFF");
        plantState = "OFF";
        elt.innerText = "Auto Plant [" + plantState + "]";
        elt.classList.remove('btn-success');
        elt.classList.add('btn-danger');
        clearInterval(autoPlantTimer);
    }

    function doPlant() {
        App.game.farming.plantAll(FarmController.selectedBerry());
    }

    // Harvest - cmd, start, stop, do
    function autoHarvest(elt, init=false) {
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
        elt.innerText = "Auto Harvest [" + harvestState + "]";
        elt.classList.remove('btn-danger');
        elt.classList.add('btn-success');
    }

    function stopHarvest(elt) {
        localStorage.setItem("autoHarvestState", "OFF");
        harvestState = "OFF";
        elt.innerText = "Auto Harvest [" + harvestState + "]";
        elt.classList.remove('btn-success');
        elt.classList.add('btn-danger');
        clearInterval(autoHarvestTimer);
    }

    function doHarvest() {
        App.game.farming.harvestAll();
    }

    // Mulch - cmd, start, stop, do
    function autoMulch(elt, init=false) {
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
        elt.innerText = "Auto Mulch [" + mulchState + "]";
        elt.classList.remove('btn-danger');
        elt.classList.add('btn-success');
    }

    function stopMulch(elt) {
        localStorage.setItem("autoMulchState", "OFF");
        mulchState = "OFF";
        elt.innerText = "Auto Mulch [" + mulchState + "]";
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
