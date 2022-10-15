// ==UserScript==
// @name        [Pokeclicker] Enhanced Auto Mine
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.7
// @author      Ephenia (Credit: falcon71, KarmaAlex)
// @description Automatically mines the Underground with Bombs. Features adjustable settings as well.
// @updateURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautomine.user.js
// ==/UserScript==

var mineState;
var smallRestoreState;
// var awaitAutoMine;
var setThreshold;
var autoMineTimer;
var resetInProgress;
var busyMining;
var autoMineSkip;
var layersMined;
var sellTreasureState;
var treasureHunter;
const treasureItems = ['Evolution Items', 'Gem Plates', 'Shards', 'Fossils'];

function initAutoMine() {
    if (mineState) {
        autoMineTimer = setInterval(function () {
            doAutoMine();
        }, 1000);
    }

    setThreshold = +setThreshold
    resetInProgress = false;
    localStorage.setItem("undergroundLayersMined", App.game.statistics.undergroundLayersMined());
    layersMined = JSON.parse(localStorage.getItem('undergroundLayersMined'));

    const minerHTML = document.createElement("div");
    minerHTML.innerHTML = `<button id="auto-mine-start" class="col-12 col-md-2 btn btn-${mineState ? 'success' : 'danger'}">Auto Mine [${mineState ? 'ON' : 'OFF'}]</button>
<button id="small-restore-start" class="col-12 col-md-2 btn btn-${smallRestoreState ? 'success' : 'danger'}">Auto Small Restore [${smallRestoreState ? 'ON' : 'OFF'}]</button>
<select id="treasure-hunter" class="col-12 col-md-2 btn">
  <option value="-1">Selected Item</option>
  <option value="0">Evolution Items</option>
  <option value="1">Gem Plates</option>
  <option value="2">Shards</option>
  <option value="3">Fossils</option>
</select>
<div id="threshold-input" class="col-12 col-md-3 btn-secondary"><img title="Money" src="assets/images/currency/money.svg" height="25px">
<input title="Enter in a value where Small Restores will stop being bought at." type="text" id="small-restore"></div>
<div id="skip-input" class="col-12 col-md-3 btn-secondary">
<input title="Auto skipping occurs if the max items in a layer is lower than the value put here." type="text" id="auto-skip"></div>`
    document.querySelectorAll('#mineBody + div')[0].prepend(minerHTML);
    $("#auto-mine-start").unwrap();
    document.getElementById('small-restore').value = setThreshold.toLocaleString('en-US');
    document.getElementById('treasure-hunter').value = treasureHunter;
    document.getElementById('auto-skip').value = autoMineSkip.toLocaleString('en-US');
    const autoSeller = document.createElement("div");
    autoSeller.innerHTML = `<div>
    <button id="auto-sell-treasure" class="col-12 col-md-3 btn btn-${sellTreasureState ? 'success' : 'danger'}">Auto Sell Treasure [${sellTreasureState ? 'ON' : 'OFF'}]</button>
</div>`
    document.getElementById('treasures').prepend(autoSeller);

    document.getElementById('auto-mine-start').addEventListener('click', event => { startAutoMine(event); });
    document.getElementById('small-restore-start').addEventListener('click', event => { autoRestore(event); });
    document.getElementById('auto-sell-treasure').addEventListener('click', event => { autoSellTreasure(event); });
    document.getElementById('treasure-hunter').addEventListener('input', event => { treasureHunt(event); });

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

    addGlobalStyle('#threshold-input { display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:space-evenly;align-items:center; }');
    addGlobalStyle('#skip-input { display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:space-evenly;align-items:center; }');
    addGlobalStyle('#small-restore { width:150px; }');
    addGlobalStyle('#auto-skip { width:150px; }');
}

function startAutoMine(event) {
    const element = event.target;
    mineState = !mineState
    mineState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Auto Mine [${mineState ? 'ON' : 'OFF'}]`;
    if (mineState) {
        autoMineTimer = setInterval(function () {
            doAutoMine();
        }, 1000); // Happens every 1 second
    } else {
        clearTimeout(busyMining);
        //clearTimeout(mineComplete);
        resetInProgress = false;
        clearInterval(autoMineTimer)
    }
    localStorage.setItem('autoMineState', mineState);
}

function doAutoMine() {
    let getEnergy = Math.floor(App.game.underground.energy);
    const getMoney = App.game.wallet.currencies[GameConstants.Currency.money]();
    const buriedItems = Mine.itemsBuried();
    const skipsRemain = Mine.skipsRemaining();
    const smallRestore = +player.itemList["SmallRestore"]();
    const mediumRestore = player.itemList["MediumRestore"]();
    const largeRestore = player.itemList["LargeRestore"]();
    const getCost = ItemList["SmallRestore"].price();
    const treasureHunting = Math.sign(treasureHunter) >= 0;
    const surveyResult = Mine.surveyResult();
    let validTreasure;
    if (treasureHunting) {
        try { validTreasure = surveyResult.includes(treasureItems[treasureHunter]) }
        catch (err) { validTreasure = null }
    }
    if (treasureHunting && validTreasure === false && skipsRemain !== 0) {
        resetLayer();
    } else if (validTreasure || (treasureHunting && validTreasure === null)) {
        mineMain();
    } else if (buriedItems >= autoMineSkip || skipsRemain === 0) {
        mineMain();
    } else {
        resetLayer();
    }
    if (layersMined !== App.game.statistics.undergroundLayersMined()) {
        if (sellTreasureState) {
            Underground.sellAllMineItems();
        }
        localStorage.setItem('undergroundLayersMined', App.game.statistics.undergroundLayersMined());
        layersMined = JSON.parse(localStorage.getItem('undergroundLayersMined'));
    }

    function mineMain() {
        if (smallRestoreState) {
            if ((getCost === 30000) && (smallRestore === 0) && (getMoney >= setThreshold + 30000)) {
                ItemList["SmallRestore"].buy(1);
            }
            if (getEnergy < 15) {
                if (largeRestore > 0) {
                    ItemList["LargeRestore"].use();
                } else if (mediumRestore > 0) {
                    ItemList["MediumRestore"].use();
                } else {
                    ItemList["SmallRestore"].use();
                }
            }
        }
        if (!surveyResult && treasureHunting) {
            if (getEnergy >= 15) {
                Mine.survey(); $('#mine-survey-result').tooltip("hide");
            }
            return true;
        } else {
            if (getEnergy >= 1) {
                if (Mine.toolSelected() !== 0) {
                    Mine.toolSelected(Mine.Tool.Chisel);
                }
                var mineEl = document.getElementById('mineBody');
                var rewards = mineEl.querySelectorAll('.mineReward');
                for (var ii = 0; ii < rewards.length; ii++) {
                    var reward = rewards[ii];
                    // var rewardParent = reward.parentNode;
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
                            }
                        }
                    }
                }
            }
            if (getEnergy >= 10) {
                Mine.bomb();
            }
        }
    }

    function resetLayer() {
        if (!resetInProgress) {
            if (Mine.itemsBuried() >= Mine.itemsFound()) {
                // Don't resolve queued up calls to checkCompleted() until completed() is finished and sets loadingNewLayer to false
                if (Mine.loadingNewLayer === true) {
                    resetInProgress = true;
                }
                if (!resetInProgress) {
                    Mine.loadingNewLayer = true;
                    setTimeout(Mine.completed, 1500);
                    //GameHelper.incrementObservable(App.game.statistics.undergroundLayersMined);
                    if (Mine.skipsRemaining() !== 0) {
                        GameHelper.incrementObservable(Mine.skipsRemaining, -1);
                    }
                    busyMining = setTimeout(function () {
                        resetInProgress = false;
                    }, 1500);
                } else {
                    resetInProgress = false;
                }
            }
        }
    }
}

function autoRestore(event) {
    const element = event.target;
    smallRestoreState = !smallRestoreState;
    smallRestoreState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Auto Small Restore [${smallRestoreState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('autoSmallRestore', smallRestoreState);
}

function autoSellTreasure(event) {
    const element = event.target;
    sellTreasureState = !sellTreasureState;
    sellTreasureState ? element.classList.replace('btn-danger', 'btn-success') : element.classList.replace('btn-success', 'btn-danger');
    element.textContent = `Auto Sell Treasure [${sellTreasureState ? 'ON' : 'OFF'}]`;
    localStorage.setItem('autoSellTreasure', sellTreasureState);
}

function treasureHunt(event) {
    const element = event.target;
    const value = +element.value;
    treasureHunter = value;
    localStorage.setItem('treasureHunter', value);
}

if (!localStorage.getItem('autoMineState')) {
    localStorage.setItem("autoMineState", false);
}
if (!localStorage.getItem('autoSmallRestore')) {
    localStorage.setItem("autoSmallRestore", false);
}
if (!localStorage.getItem('autoBuyThreshold')) {
    localStorage.setItem("autoBuyThreshold", 0);
}
if (!localStorage.getItem('autoMineSkip')) {
    localStorage.setItem("autoMineSkip", 0);
}
if (!localStorage.getItem('autoSellTreasure')) {
    localStorage.setItem("autoSellTreasure", false);
}
if (!localStorage.getItem('treasureHunter')) {
    localStorage.setItem("treasureHunter", -1);
}
mineState = JSON.parse(localStorage.getItem('autoMineState'));
smallRestoreState = JSON.parse(localStorage.getItem('autoSmallRestore'));
setThreshold = JSON.parse(localStorage.getItem('autoBuyThreshold'));
autoMineSkip = JSON.parse(localStorage.getItem('autoMineSkip'));
sellTreasureState = JSON.parse(localStorage.getItem('autoSellTreasure'));
treasureHunter = JSON.parse(localStorage.getItem('treasureHunter'));

function loadScript() {
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function () {
        var result = oldInit.apply(this, arguments)
        initAutoMine()
        return result
    }
}

var scriptName = 'enhancedautomine'

if (document.getElementById('scriptHandler') !== undefined) {
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) !== null) {
        if (localStorage.getItem(scriptName) === 'true') {
            loadScript()
        }
    }
    else {
        localStorage.setItem(scriptName, 'true')
        loadScript()
    }
}
else {
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
