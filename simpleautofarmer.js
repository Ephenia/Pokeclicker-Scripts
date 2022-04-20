// ==UserScript==
// @name        [Pokeclicker] Simple Auto Farmer
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.4
// @author      Ephenia
// @description Adds buttons to automatically plant and harvest all of any specific berry. Make sure to have the berry selected that you want to auto plant & harvest before enabling it. This includes an auto Mulcher as well.
// ==/UserScript==

var farmState;
var mulchState;
var farmColor;
var mulchColor;
var autoFarmTimer;
var awaitAutoFarm;
var newSave;
var trainerCards;
var shovelList = document.getElementById('shovelList');

function initAutoFarm() {
    if (farmState == "ON") {
        autoFarmTimer = setInterval(function () {
            doPlantHarvest();
        }, 1000);
    }
    if (farmState == "OFF") {
        farmColor = "danger"
    } else {
        farmColor = "success"
    }
    if (mulchState == "OFF") {
        mulchColor = "danger"
    } else {
        mulchColor = "success"
    }

    var elemAF = document.createElement("div");
    elemAF.innerHTML = `<div class="row justify-content-center py-0">
    <div class="col-6 pr-0">
    <button id="auto-farm-start" class="btn btn-`+ farmColor + ` btn-block" style="font-size:9pt;">
    Auto Farm [`+ farmState + `]
    </button>
    </div>
    <div class="col-6 pl-0">
    <button id="auto-mulch-start" class="btn btn-`+ mulchColor + ` btn-block" style="font-size:9pt;">
    Auto Mulch [`+ mulchState + `]
    </button>
    </div>
    </div>`
    shovelList.before(elemAF)

    $("#auto-farm-start").click(startAutoFarm);
    $("#auto-mulch-start").click(autoMulch);

    function startAutoFarm() {
        if (farmState == "OFF") {
            localStorage.setItem("autoFarmState", "ON");
            farmState = "ON"
            autoFarmTimer = setInterval(function () {
                doPlantHarvest();
            }, 1000); // Happens every 1 second
            document.getElementById('auto-farm-start').innerText = `Auto Farm [` + farmState + `]`
            document.getElementById("auto-farm-start").classList.remove('btn-danger');
            document.getElementById("auto-farm-start").classList.add('btn-success');
        } else {
            endAutoFarm();
        }
    }

    function doPlantHarvest() {
        App.game.farming.plantAll(FarmController.selectedBerry())
        if (mulchState == "ON") {
            FarmController.mulchAll()
        }
        App.game.farming.harvestAll()
    }

    function autoMulch() {
        if (mulchState == "OFF") {
            localStorage.setItem("autoMulchState", "ON");
            mulchState = "ON"
            document.getElementById('auto-mulch-start').innerText = `Auto Mulch [` + mulchState + `]`
            document.getElementById("auto-mulch-start").classList.remove('btn-danger');
            document.getElementById("auto-mulch-start").classList.add('btn-success');
        } else {
            localStorage.setItem("autoMulchState", "OFF");
            mulchState = "OFF"
            document.getElementById('auto-mulch-start').innerText = `Auto Mulch [` + mulchState + `]`
            document.getElementById("auto-mulch-start").classList.remove('btn-success');
            document.getElementById("auto-mulch-start").classList.add('btn-danger');
        }
    }

    function endAutoFarm() {
        localStorage.setItem("autoFarmState", "OFF");
        farmState = "OFF"
        document.getElementById('auto-farm-start').innerText = `Auto Farm [` + farmState + `]`
        document.getElementById("auto-farm-start").classList.remove('btn-success');
        document.getElementById("auto-farm-start").classList.add('btn-danger');
        clearInterval(autoFarmTimer)
    }
}

if (localStorage.getItem('autoFarmState') == null) {
    localStorage.setItem("autoFarmState", "OFF");
}
if (localStorage.getItem('autoMulchState') == null) {
    localStorage.setItem("autoMulchState", "OFF");
}
farmState = localStorage.getItem('autoFarmState');
mulchState = localStorage.getItem('autoMulchState');

function loadScript(){
    var scriptLoad = setInterval(function () {
        try {
            newSave = document.querySelectorAll('label')[0];
            trainerCards = document.querySelectorAll('.trainer-card');
        } catch (err) { }
        if (typeof newSave != 'undefined') {
            for (var i = 0; i < trainerCards.length; i++) {
                trainerCards[i].addEventListener('click', checkAutoFarm, false);
            }
            newSave.addEventListener('click', checkAutoFarm, false);
            clearInterval(scriptLoad)
        }
    }, 50);
}

var scriptName = 'simpleautofarmer'

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


function checkAutoFarm() {
    awaitAutoFarm = setInterval(function () {
        var farmAccess;
        try {
            farmAccess = App.game.farming.canAccess();
        } catch (err) { }
        if (typeof farmAccess != 'undefined') {
            if (farmAccess == true) {
                initAutoFarm();
                clearInterval(awaitAutoFarm)
            } else {
                //console.log("Checking for access...")
            }
        }
    }, 1000);
}
