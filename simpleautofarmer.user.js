// ==UserScript==
// @name          [Pokeclicker] Simple Auto Farmer
// @namespace     Pokeclicker Scripts
// @author        Ephenia / Akwawa / perkasthor / davide-lugli (update 1.6) / Optimatum
// @description   Adds options to automatically plant, harvest, replant, and remulch. Unlike harvesting, replanting only harvests berries right before they wither, to maximize any auras. Make sure the correct berry is selected before auto planting; the script will save your selection across restarts. Auto replant and mulch maintain the berry/mulch already in each plot.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.7

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/simpleautofarmer.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/simpleautofarmer.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==//

var scriptName = 'simpleautofarmer';

function initAutoFarm() {
    var autoFarmLoop;

    var plantState;
    var harvestState;
    var replantState;
    var mulchState;

    plantState = JSON.parse(localStorage.getItem('autoPlantState'));
    harvestState = JSON.parse(localStorage.getItem('autoHarvestState'));
    replantState = JSON.parse(localStorage.getItem('autoReplantState'));
    mulchState = JSON.parse(localStorage.getItem('autoMulchState'));

    let plantSelected = JSON.parse(localStorage.getItem('autoPlantSelected'));
    FarmController.selectedBerry(plantSelected);
    FarmController.navigateIndex(Math.floor(plantSelected / FarmController.BERRIES_PER_PAGE));

    createMenu();
    if (plantState || replantState || harvestState || mulchState) {
        toggleFarmLoop();
    }

    function createMenu() {
        var elemAF = document.createElement("div");
        var divMenu1 = document.createElement("div");
        var divMenu2 = document.createElement("div");
        const shovelList = document.getElementById('shovelList');

        divMenu1.className = "row justify-content-center py-0";
        divMenu2.className = "row justify-content-center py-0";

        elemAF.appendChild(divMenu1);
        elemAF.appendChild(divMenu2);
        shovelList.before(elemAF);

        const createButton = (name, state, func, rl, top) => {
            var buttonDiv = document.createElement('div');
            buttonDiv.className = `col-6 p${rl}-0`;

            var button = document.createElement('button');
            button.setAttribute('id', `auto-${name}-toggle`);
            button.className = 'btn btn-block btn-' + (state ? 'success' : 'danger');
            button.style.height = '50px';
            button.style.fontSize = '9pt';
            button.textContent = `Auto ${name[0].toUpperCase() + name.slice(1)}\n[${plantState ? 'ON' : 'OFF'}]`;
            button.onclick = function() { func(); };

            buttonDiv.appendChild(button);
            if (top) {
                divMenu1.appendChild(buttonDiv);
            } else {
                divMenu2.appendChild(buttonDiv);
            }
        }

        createButton('plant', plantState, autoPlantToggle, 'r', true);
        createButton('harvest', harvestState, autoHarvestToggle, 'l', true);
        createButton('replant', replantState, autoReplantToggle, 'r', false);
        createButton('mulch', mulchState, autoMulchToggle, 'l', false);
    }

    function toggleFarmLoop() {
        if (plantState || replantState || harvestState || mulchState) {
            if (!autoFarmLoop) {
                autoFarmLoop = setInterval(autoFarmTick, 1000);
            }
        } else {
            autoFarmLoop = clearInterval(autoFarmLoop);
        }
    }

    function autoFarmTick() {
        if (replantState) {
            doReplant();
        } else {
            if (harvestState) {
                doHarvest();
            }
            if (plantState) {
                doPlant();
            }
        }
        if (mulchState) {
            doMulch();
        }
    }

    function autoPlantToggle() {
        plantState = !plantState;
        localStorage.setItem("autoPlantState", plantState);
        toggleFarmLoop();
        if (replantState) {
            autoReplantToggle();
        }
        let elt = document.getElementById('auto-plant-toggle');
        if (plantState) {
            elt.innerText = "Auto Plant\n[ON]";
            elt.classList.remove('btn-danger');
            elt.classList.add('btn-success');
        } else {
            elt.innerText = "Auto Plant\n[OFF]";
            elt.classList.remove('btn-success');
            elt.classList.add('btn-danger');
        }
    }

    function doPlant() {
        App.game.farming.plantAll(FarmController.selectedBerry());
    }

    function autoHarvestToggle() {
        harvestState = !harvestState;
        localStorage.setItem("autoHarvestState", harvestState);
        toggleFarmLoop();
        if (replantState) {
            autoReplantToggle();
        }
        let elt = document.getElementById('auto-harvest-toggle');
        if (harvestState) {
            elt.innerText = "Auto Harvest\n[ON]";
            elt.classList.remove('btn-danger');
            elt.classList.add('btn-success');
        } else {
            elt.innerText = "Auto Harvest\n[OFF]";
            elt.classList.remove('btn-success');
            elt.classList.add('btn-danger');
        }
    }

    function doHarvest() {
        App.game.farming.harvestAll();
    }

    function autoReplantToggle() {
        replantState = !replantState;
        localStorage.setItem("autoReplantState", replantState);
        toggleFarmLoop();
        if (plantState) {
            autoPlantToggle();
        }
        if (harvestState) {
            autoHarvestToggle();
        }
        let elt = document.getElementById('auto-replant-toggle');
        if (replantState) {
            elt.innerText = "Auto Replant\n[ON]";
            elt.classList.remove('btn-danger');
            elt.classList.add('btn-success');
        } else {
            elt.innerText = "Auto Replant\n[OFF]";
            elt.classList.remove('btn-success');
            elt.classList.add('btn-danger');
        }
    }

    function doReplant() {
        const berryData = App.game.farming.berryData;
        // Check each tile
        for (let i = 0; i < 25; i++) {
            let plot = App.game.farming.plotList[i];
            let berry = plot.berry;
            if (berry >= 0) {
                var timeLeft = berryData[berry].growthTime[4] - plot.age;
                timeLeft /= (App.game.farming.getGrowthMultiplier() * plot.getGrowthMultiplier());
                if (timeLeft < 10) {
                    App.game.farming.harvest(i, false);
                    App.game.farming.plant(i, berry, false);
                }
            }
        }
    }

    function autoMulchToggle() {
        mulchState = !mulchState;
        localStorage.setItem("autoMulchState", mulchState);
        toggleFarmLoop();
        let elt = document.getElementById('auto-mulch-toggle');
        if (mulchState) {
            elt.innerText = "Auto Mulch\n[ON]";
            elt.classList.remove('btn-danger');
            elt.classList.add('btn-success');
        } else {
            elt.innerText = "Auto Mulch\n[OFF]";
            elt.classList.remove('btn-success');
            elt.classList.add('btn-danger');
        }
    }

    // Add more of same kind of mulch
    function doMulch() {
        for (let i = 0; i < 25; i++) {
            var plot = App.game.farming.plotList[i];
            if (plot.mulch != MulchType.None && plot.mulchTimeLeft < 15) {
                App.game.farming.addMulch(i, plot.mulch);
            }
        }
    }
}

function initSelectedBerryTracking() {
    let berryEntry = document.getElementById('seeds').querySelector('li[data-bind*="selectedBerry"]');
    let bound = berryEntry.getAttribute('data-bind');
    bound = bound.replace(`click: function() {`, `click: function() {localStorage.setItem('autoPlantSelected', $data);`);
    berryEntry.setAttribute('data-bind', bound);

    const navigateLeft = FarmController.navigateLeft.bind(FarmController);
    const navigateRight = FarmController.navigateRight.bind(FarmController);
    FarmController.navigateLeft = function() {
        var result = navigateLeft();
        localStorage.setItem('autoPlantSelected', FarmController.selectedBerry());
        return result;
    }
    FarmController.navigateRight = function() {
        var result = navigateRight();
        localStorage.setItem('autoPlantSelected', FarmController.selectedBerry());
        return result;
    }
}

function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args);
        if (App.game && !hasInitialized) {
            initAutoFarm();
            hasInitialized = true;
        }
        return result;
    }

    initSelectedBerryTracking();
}

function initLocalStorage(param, value) {
    let curVal = localStorage.getItem(param);
    try {
        curVal = JSON.parse(curVal);
    } catch (e) {
        curVal = null;
    }
    if (curVal == null || (typeof curVal !== typeof value)) {
        localStorage.setItem(param, value);
    }
}

initLocalStorage("autoPlantState", false);
initLocalStorage("autoHarvestState", false);
initLocalStorage("autoReplantState", false);
initLocalStorage("autoMulchState", false);
initLocalStorage("autoPlantSelected", 0);


if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
