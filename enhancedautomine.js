// ==UserScript==
// @name        [Pokeclicker] Enhanced Auto Mine
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.6
// @author      Ephenia (Credit: falcon71, KarmaAlex, Optimatum)
// @description Automatically mines the Underground with Bombs. Features adjustable settings as well.
// ==/UserScript==

var mineState;
var smallRestoreState;
var awaitAutoMine;
var setThreshold;
var autoMineTimer;
var mineColor;
var smallRestoreColor;
var resetInProgress;
var busyMining;
var autoMineSkip;
var minDiamonds;
var layersMined;
var sellTreasureState;
var sellTreasureColor;
var sellPlateState;
var sellPlateColor;
var newSave;
var trainerCards;

function initAutoMine() {
    if (mineState == "ON") {
        autoMineTimer = setInterval(function () {
            doAutoMine();
        }, 1000);
    }
    if (mineState == "OFF") {
        mineColor = "danger"
    } else {
        mineColor = "success"
    }
    if (smallRestoreState == "OFF") {
        smallRestoreColor = "danger"
    } else {
        smallRestoreColor = "success"
    }
    if (sellTreasureState == "OFF") {
        sellTreasureColor = "danger"
    } else {
        sellTreasureColor = "success"
    }
    if (sellPlateState == "OFF") {
        sellPlateColor = "danger"
    } else {
        sellPlateColor = "success"
    }
    setThreshold = +setThreshold
    resetInProgress = "NO"
    localStorage.setItem("undergroundLayersMined", App.game.statistics.undergroundLayersMined());
    layersMined = localStorage.getItem('undergroundLayersMined');

    var minerHTML = document.createElement("div");
    minerHTML.innerHTML = `<button id="auto-mine-start" class="col-12 col-md-3 btn btn-` + mineColor + `">Auto Mine [` + mineState + `]</button>
<button id="small-restore-start" class="col-12 col-md-3 btn btn-`+ smallRestoreColor + `">Auto Small Restore [` + smallRestoreState + `]</button>
<div id="threshold-input" class="col-12 col-md-2 btn-secondary"><img title="Money" src="assets/images/currency/money.svg" height="25px">
<input title="Won't automatically purchase Small Restores when your money is below this value." type="text" id="small-restore"></div>
<div id="skip-input" class="col-12 col-md-2 btn-secondary"><img title="Items" src="assets/images/items/underground/Hard Stone.png" height="25px">
<input title="Automatically skips layers with number of items less than this value." type="text" id="auto-skip"></div>
<div id="min-diamonds-input" class="col-12 col-md-2 btn-secondary"><img title="Diamonds" src="assets/images/currency/diamond.svg" height="25px">
<input title="Automatically skips layers with diamond value less than this value." type="text" id="min-diamonds"></div>`
    document.querySelectorAll('#mineBody + div')[0].prepend(minerHTML);
    $("#auto-mine-start").unwrap();
    document.getElementById('small-restore').value = setThreshold.toLocaleString('en-US');
    document.getElementById('auto-skip').value = autoMineSkip.toLocaleString('en-US');
    document.getElementById('min-diamonds').value = minDiamonds.toLocaleString('en-US');
    var autoSeller = document.createElement("div");
    autoSeller.innerHTML = `<div>
    <button id="auto-sell-treasure" class="col-12 col-md-3 btn btn-`+ sellTreasureColor + `">Auto Sell Treasure [` + sellTreasureState + `]</button>
<button id="auto-sell-plate" class="col-12 col-md-3 btn btn-`+ sellPlateColor + `">Auto Sell Plate [` + sellPlateState + `]</button>
</div>`
    document.getElementById('treasures').prepend(autoSeller);
    addGlobalStyle('#threshold-input { display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:space-evenly;align-items:center; }');
    addGlobalStyle('#skip-input { display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:space-evenly;align-items:center; }');
    addGlobalStyle('#min-diamonds-input { display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:space-evenly;align-items:center; }');
    addGlobalStyle('#small-restore { width:100px; }');
    addGlobalStyle('#auto-skip { width:100px; }');
    addGlobalStyle('#min-diamonds { width:100px; }');

    $("#auto-mine-start").click(startAutoMine);
    $("#small-restore-start").click(autoRestore);
    $("#auto-sell-treasure").click(autoSellTreasure);
    $("#auto-sell-plate").click(autoSellPlate);

    function startAutoMine() {
        if (mineState == "OFF") {
            localStorage.setItem("autoMineState", "ON");
            mineState = "ON"
            autoMineTimer = setInterval(function () {
                doAutoMine();
            }, 1000); // Happens every 1 second
            document.getElementById('auto-mine-start').innerText = `Auto Mine [` + mineState + `]`
            document.getElementById("auto-mine-start").classList.remove('btn-danger');
            document.getElementById("auto-mine-start").classList.add('btn-success');
        } else {
            endAutoMine();
        }
    }

    function doAutoMine() {
        var getEnergy = Math.floor(App.game.underground.energy);
        var getMoney = App.game.wallet.currencies[GameConstants.Currency.money]();
        var buriedItems = Mine.itemsBuried();
        var diamondValue =  Mine.surveyResult() ? +Mine.surveyResult().replace(/.*Diamond Value: /, "") : 0;
        var skipsRemain = Mine.skipsRemaining();
        var minedThisInterval = false;
        const smallRestore = player.itemList["SmallRestore"]();
        const mediumRestore = player.itemList["MediumRestore"]();
        const largeRestore = player.itemList["LargeRestore"]();
        var getCost = ItemList["SmallRestore"].price();
        var shopWindow = document.getElementById('shopModal')
        if (smallRestoreState == "ON") {
            if ((getCost == 30000) && (+smallRestore == 0) && (getMoney >= setThreshold + 30000)) {
                ItemList["SmallRestore"].buy(1);
            }
            if (getEnergy < 15) {
                // 15 energy guaranteed to be enough for a bomb or survey
                if (largeRestore > 0) {
                    ItemList["LargeRestore"].use();
                } else if (mediumRestore > 0) {
                    ItemList["MediumRestore"].use();
                } else {
                    ItemList["SmallRestore"].use();
                }
                // Recalculate energy so we can use it immediately
                getEnergy = Math.floor(App.game.underground.energy);
            }
        }
        if ((buriedItems >= autoMineSkip && diamondValue >= minDiamonds) || skipsRemain == 0) {
            if (getEnergy >= 1) {
                if (Mine.toolSelected() != 0) {
                    Mine.toolSelected(Mine.Tool.Chisel);
                }
                var mineEl = document.getElementById('mineBody');
                var rewards = mineEl.querySelectorAll('.mineReward');
                for (var ii = 0; ii < rewards.length; ii++) {
                    var reward = rewards[ii];
                    var rewardParent = reward.parentNode;
                    var ri = +reward.parentNode.getAttribute('data-i');
                    var rj = +reward.parentNode.getAttribute('data-j');
                    for (var i = -1; i <= 1; i++) {
                        for (var j = -1; j <= 1; j++) {
                            var ti = ri + i;
                            var tj = rj + j;
                            var checkTile = mineEl.querySelector('.mineSquare[data-i="' + ti + '"][data-j="' + tj + '"]');
                            if (checkTile && (
                                checkTile.classList.contains('rock1') ||
                                checkTile.classList.contains('rock2') ||
                                checkTile.classList.contains('rock3') ||
                                checkTile.classList.contains('rock4') ||
                                checkTile.classList.contains('rock5')
                            )) {
                                Mine.click(ti, tj);
                                getEnergy -= 1;
                                minedThisInterval = true;
                            }
                        }
                    }
                }
            }
            if (getEnergy >= 10 && !minedThisInterval) {
                Mine.bomb();
            }
        } else if (buriedItems >= autoMineSkip && minDiamonds > 0 && !Mine.surveyResult()) {
            // Level not yet surveyed
            if (getEnergy >= App.game.underground.getSurvey_Cost()) {
                Mine.survey();
                $('#mine-survey-result').tooltip('hide');
            }
        } else {
            if (resetInProgress == "NO") {
                if (Mine.itemsBuried() >= Mine.itemsFound()) {
                    // Don't resolve queued up calls to checkCompleted() until completed() is finished and sets loadingNewLayer to false
                    if (Mine.loadingNewLayer == true) {
                        resetInProgress = "YES"
                    }
                    if (resetInProgress == "NO") {
                        Mine.loadingNewLayer = true;
                        setTimeout(Mine.completed, 1500);
                        //GameHelper.incrementObservable(App.game.statistics.undergroundLayersMined);
                        if (Mine.skipsRemaining() != 0) {
                            GameHelper.incrementObservable(Mine.skipsRemaining, -1);
                        }
                        busyMining = setTimeout(function () {
                            resetInProgress = "NO"
                        }, 1500);
                    } else {
                        resetInProgress = "NO"
                    }
                }
            }
        }
        if (layersMined != App.game.statistics.undergroundLayersMined()) {
            var treasureLength = player.mineInventory().length;
            if (sellTreasureState == "ON") {
                for (var i = 0; i < treasureLength; i++) {
                    var valueType = player.mineInventory()[i].valueType
                    if (valueType == "Diamond") {
                        var treasureID = player.mineInventory()[i].id;
                        Underground.sellMineItem(treasureID, Infinity)
                    }
                }
            }
            if (sellPlateState == "ON") {
                for (var ii = 0; ii < treasureLength; ii++) {
                    var getName = player.mineInventory()[ii].name;
                    if (getName.includes("Plate")) {
                        var plateID = player.mineInventory()[ii].id;
                        Underground.sellMineItem(plateID, Infinity)
                    }
                }
            }
            localStorage.setItem("undergroundLayersMined", App.game.statistics.undergroundLayersMined());
            layersMined = localStorage.getItem('undergroundLayersMined');
        }
    }

    document.querySelector('#small-restore').addEventListener('input', event => {
        setThreshold = +event.target.value.replace(/[A-Za-z!@#$%^&*()]/g, '').replace(/[,]/g, "");
        localStorage.setItem("autoBuyThreshold", setThreshold);
        event.target.value = setThreshold.toLocaleString('en-US');
    });

    document.querySelector('#auto-skip').addEventListener('input', event => {
        autoMineSkip = +event.target.value.replace(/[A-Za-z!@#$%^&*()]/g, '').replace(/[,]/g, "");
        localStorage.setItem("autoMineSkip", autoMineSkip);
        event.target.value = autoMineSkip.toLocaleString('en-US');
    });
  
    document.querySelector('#min-diamonds').addEventListener('input', event => {
        minDiamonds = +event.target.value.replace(/[A-Za-z!@#$%^&*()]/g, '').replace(/[,]/g, "");
        localStorage.setItem("minDiamonds", minDiamonds);
        event.target.value = minDiamonds.toLocaleString('en-US');
    });

    function autoRestore() {
        if (smallRestoreState == "OFF") {
            smallRestoreState = "ON"
            document.getElementById("small-restore-start").classList.remove('btn-danger');
            document.getElementById("small-restore-start").classList.add('btn-success');
        } else {
            smallRestoreState = "OFF"
            document.getElementById("small-restore-start").classList.remove('btn-success');
            document.getElementById("small-restore-start").classList.add('btn-danger');
        }
        document.getElementById('small-restore-start').innerText = `Auto Small Restore [` + smallRestoreState + `]`
        localStorage.setItem("autoSmallRestore", smallRestoreState);
    }

    function autoSellTreasure() {
        if (sellTreasureState == "OFF") {
            sellTreasureState = "ON"
            document.getElementById("auto-sell-treasure").classList.remove('btn-danger');
            document.getElementById("auto-sell-treasure").classList.add('btn-success');
        } else {
            sellTreasureState = "OFF"
            document.getElementById("auto-sell-treasure").classList.remove('btn-success');
            document.getElementById("auto-sell-treasure").classList.add('btn-danger');
        }
        document.getElementById('auto-sell-treasure').innerText = `Auto Sell Treasure [` + sellTreasureState + `]`
        localStorage.setItem("autoSellTreasure", sellTreasureState);
    }

    function autoSellPlate() {
        if (sellPlateState == "OFF") {
            sellPlateState = "ON"
            document.getElementById("auto-sell-plate").classList.remove('btn-danger');
            document.getElementById("auto-sell-plate").classList.add('btn-success');
        } else {
            sellPlateState = "OFF"
            document.getElementById("auto-sell-plate").classList.remove('btn-success');
            document.getElementById("auto-sell-plate").classList.add('btn-danger');
        }
        document.getElementById('auto-sell-plate').innerText = `Auto Sell Plate [` + sellPlateState + `]`
        localStorage.setItem("autoSellPlate", sellPlateState);
    }

    function endAutoMine() {
        localStorage.setItem("autoMineState", "OFF");
        mineState = "OFF"
        document.getElementById('auto-mine-start').innerText = `Auto Mine [` + mineState + `]`
        document.getElementById("auto-mine-start").classList.remove('btn-success');
        document.getElementById("auto-mine-start").classList.add('btn-danger');
        clearTimeout(busyMining);
        //clearTimeout(mineComplete);
        resetInProgress = "NO";
        clearInterval(autoMineTimer)
    }

}

if (localStorage.getItem('autoMineState') == null) {
    localStorage.setItem("autoMineState", "OFF");
}
if (localStorage.getItem('autoSmallRestore') == null) {
    localStorage.setItem("autoSmallRestore", "OFF");
}
if (localStorage.getItem('autoBuyThreshold') == null) {
    localStorage.setItem("autoBuyThreshold", "0");
}
if (localStorage.getItem('autoMineSkip') == null) {
    localStorage.setItem("autoMineSkip", "0");
}
if (localStorage.getItem('minDiamonds') == null) {
    localStorage.setItem("minDiamonds", "0");
}
if (localStorage.getItem('autoSellTreasure') == null) {
    localStorage.setItem("autoSellTreasure", "OFF");
}
if (localStorage.getItem('autoSellPlate') == null) {
    localStorage.setItem("autoSellPlate", "OFF");
}
mineState = localStorage.getItem('autoMineState');
smallRestoreState = localStorage.getItem('autoSmallRestore');
setThreshold = localStorage.getItem('autoBuyThreshold');
autoMineSkip = localStorage.getItem('autoMineSkip');
minDiamonds = localStorage.getItem('minDiamonds');
sellTreasureState = localStorage.getItem('autoSellTreasure');
sellPlateState = localStorage.getItem('autoSellPlate');

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initAutoMine()
        return result
    }
}

var scriptName = 'enhancedautomine'

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

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}
