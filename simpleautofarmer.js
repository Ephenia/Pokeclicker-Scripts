// ==UserScript==
// @name        [Pokeclicker] Simple Auto Farmer
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.1
// @author      Ephenia
// @description Adds buttons to automatically plant and harvest all of any specific berry. Make sure to have the berry selected that you want to auto plant & harvest before enabling it. This includes an auto Mulcher as well.
// ==/UserScript==

var farmState;
var mulchState;
var farmColor;
var mulchColor;
var autoFarmTimer;

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

    document.getElementById('seeds').innerHTML += `<div class="row justify-content-center py-0">
    <div class="col-6 pr-0">
    <button id="auto-farm-start" class="btn btn-`+farmColor+` btn-block" style="font-size:9pt;">
    Auto Farm [`+farmState+`]
    </button>
    </div>
    <div class="col-6 pl-0">
    <button id="auto-mulch-start" class="btn btn-`+mulchColor+` btn-block" style="font-size:9pt;">
    Auto Mulch [`+mulchState+`]
    </button>
    </div>
    </div>`
    $("#auto-farm-start").click (startAutoFarm);
    $("#auto-mulch-start").click (autoMulch);

    function startAutoFarm() {
        if (farmState == "OFF") {
            localStorage.setItem("autoFarmState", "ON");
            farmState = "ON"
            autoFarmTimer = setInterval(function () {
                doPlantHarvest();
            }, 1000); // Happens every 1 second
            document.getElementById('auto-farm-start').innerText = `Auto Farm [`+farmState+`]`
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
            document.getElementById('auto-mulch-start').innerText = `Auto Mulch [`+mulchState+`]`
            document.getElementById("auto-mulch-start").classList.remove('btn-danger');
            document.getElementById("auto-mulch-start").classList.add('btn-success');
        } else {
            localStorage.setItem("autoMulchState", "OFF");
            mulchState = "OFF"
            document.getElementById('auto-mulch-start').innerText = `Auto Mulch [`+mulchState+`]`
            document.getElementById("auto-mulch-start").classList.remove('btn-success');
            document.getElementById("auto-mulch-start").classList.add('btn-danger');
        }
    }

    function endAutoFarm() {
        localStorage.setItem("autoFarmState", "OFF");
        farmState = "OFF"
        document.getElementById('auto-farm-start').innerText = `Auto Farm [`+farmState+`]`
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
initAutoFarm();
