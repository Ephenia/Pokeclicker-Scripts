// ==UserScript==
// @name        [Pokeclicker] Enhanced Auto Mine
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.8
// @author      Ephenia (Credit: falcon71, KarmaAlex, umbralOptimatum)
// @description Automatically mines the Underground with Bombs. Features adjustable settings as well.
// @updateURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautomine.user.js
// ==/UserScript==

const SCRIPT_VERSION = 1.8

var mineState;
var smallRestoreState;
var awaitAutoMine;
var setThreshold;
var autoMineTimer;
var busyMining;
//var autoMineSkip;
var layersMined;
var sellTreasureState;
var treasureHunter;
var itemThreshold;

function initAutoMine() {
    if (mineState) {
        autoMineTimer = setInterval(function () {
            doAutoMine();
        }, 1000);
    }

    setThreshold = +setThreshold;
    localStorage.setItem("undergroundLayersMined", App.game.statistics.undergroundLayersMined());
    layersMined = JSON.parse(localStorage.getItem('undergroundLayersMined'));

    const minerHTML = document.createElement("div");
    minerHTML.innerHTML = `<button id="auto-mine-start" class="col-12 col-md-2 btn btn-${mineState ? 'success' : 'danger'}">Auto Mine [${mineState ? 'ON' : 'OFF'}]</button>
<button id="small-restore-start" class="col-12 col-md-3 btn btn-${smallRestoreState ? 'success' : 'danger'}">Auto Small Restore [${smallRestoreState ? 'ON' : 'OFF'}]</button>
<div id="threshold-input" class="col-12 col-md-3 btn-secondary"><img title="Money" src="assets/images/currency/money.svg" height="25px">
<input title="Value at which to stop buying Small Restores." type="text" id="small-restore"></div>
<select id="treasure-hunter" class="col-12 col-md-2 btn">
  <option value="-1">All Items</option>
  <option value="0">Fossils</option>
  <option value="1">Evolution Items</option>
  <option value="2">Gem Plates</option>
  <option value="3">Shards</option>
  <option value="4">Diamond Value</option>
</select>
<div id="item-threshold-input" class="col-12 col-md-2 btn-secondary"><img id="treasure-image" src="assets/images/currency/money.svg" height="25px">
<input title="Skips layers with fewer target items than this value." type="text" id="item-threshold"></div>`
    /* <div id="skip-input" class="col-12 col-md-3 btn-secondary">
    <input title="Automatically skips layers with fewer items than this value." type="text" id="auto-skip"></div> */
    document.querySelectorAll('#mineBody + div')[0].prepend(minerHTML);
    $("#auto-mine-start").unwrap();
    document.getElementById('small-restore').value = setThreshold.toLocaleString('en-US');
    document.getElementById('treasure-hunter').value = treasureHunter;
    document.getElementById('item-threshold').value = itemThreshold.toLocaleString('en-US');
    setTreasureImage();
    //document.getElementById('auto-skip').value = autoMineSkip.toLocaleString('en-US');
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
    document.querySelector('#item-threshold').addEventListener('input', event => {
        itemThreshold = +event.target.value.replace(/[A-Za-z!@#$%^&*()]/g, '').replace(/[,]/g, "");
        localStorage.setItem("itemThreshold", itemThreshold);
        event.target.value = itemThreshold.toLocaleString('en-US');
    });
    /*
    document.querySelector('#auto-skip').addEventListener('input', event => {
        autoMineSkip = +event.target.value.replace(/[A-Za-z!@#$%^&*()]/g, '').replace(/[,]/g, "");
        localStorage.setItem("autoMineSkip", autoMineSkip);
        event.target.value = autoMineSkip.toLocaleString('en-US');
    });
    */

    addGlobalStyle('#threshold-input { display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:space-evenly;align-items:center; }');
    addGlobalStyle('#item-threshold-input { display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:space-evenly;align-items:center; }');
    addGlobalStyle('#small-restore { width:150px; }');
    addGlobalStyle('#item-threshold { width:75px; }');
    //addGlobalStyle('#skip-input { display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:space-evenly;align-items:center; }');
    //addGlobalStyle('#auto-skip { width:100px; }');
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
    const treasureTypes = ['Fossils', 'Evolution Items', 'Gem Plates', 'Shards', 'Diamond Value'];
    const surveyResult = Mine.surveyResult();
    let treasureAmount;
    if (Mine.loadingNewLayer) {
        // Do nothing while the new layer is loading
        return;
    }
    if (treasureHunting && surveyResult) {
        // Parse survey for the treasure type we want
        try {
            const re = new RegExp(String.raw`${treasureTypes[treasureHunter]}: (\d+)`);
            treasureAmount = +re.exec(surveyResult)[1];
        } catch (err) {
            treasureAmount = 0;
        }
    }
    if (treasureHunting && !surveyResult) {
        // Survey the layer
        mineMain();
    } else if (treasureHunting && treasureAmount < itemThreshold && skipsRemain > 0) {
        // Too few of the desired treasure type, skip
        resetLayer();
    } else if (!treasureHunting && buriedItems < itemThreshold && skipsRemain > 0) {
        // Too few items, skip
        resetLayer();
    } else {
        // Either the layer meets requirements or we're out of skips
        mineMain();
    }
    if (layersMined != App.game.statistics.undergroundLayersMined()) {
        if (sellTreasureState) {
            Underground.sellAllMineItems();
        }
        localStorage.setItem('undergroundLayersMined', App.game.statistics.undergroundLayersMined());
        layersMined = JSON.parse(localStorage.getItem('undergroundLayersMined'));
    }

    function mineMain() {
        if (smallRestoreState) {
            if ((getCost == 30000) && (smallRestore == 0) && (getMoney >= setThreshold + 30000)) {
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
                // Refresh energy count so we can use it immediately
                getEnergy = Math.floor(App.game.underground.energy);
            }
        }
        if (!surveyResult && treasureHunting && skipsRemain != 0) {
            if (getEnergy >= App.game.underground.getSurvey_Cost()) {
                Mine.survey(); 
                $('#mine-survey-result').tooltip("hide");
            }
            return true;
        } else {
            let minedThisInterval = false;
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
                // Only bomb if out of places to chisel
                Mine.bomb();
            }
        }
    }

    function resetLayer() {
        if (!Mine.loadingNewLayer) {
            Mine.loadingNewLayer = true;
            setTimeout(Mine.completed, 1500);
            //GameHelper.incrementObservable(App.game.statistics.undergroundLayersMined);
            if (Mine.skipsRemaining() > 0) {
                GameHelper.incrementObservable(Mine.skipsRemaining, -1);
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
    setTreasureImage();
}

function setTreasureImage() {
    const imageSources = ['items/underground/Hard Stone.png', 'breeding/Helix Fossil.png', 'items/evolution/Fire_stone.png', 
    'items/underground/Flame Plate.png', 'items/underground/Red Shard.png', 'currency/diamond.svg'];
    const imageTitles = ['Item', 'Fossil', 'Evolution Stone', 'Plate', 'Shard', 'Diamond'];
    document.getElementById('treasure-image').src = `assets/images/${imageSources[1+treasureHunter]}`;
    document.getElementById('treasure-image').title = imageTitles[1+treasureHunter];
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
if (!localStorage.getItem('autoSellTreasure')) {
    localStorage.setItem("autoSellTreasure", false);
}
if (!localStorage.getItem('treasureHunter')) {
    localStorage.setItem("treasureHunter", -1);
}
if (!localStorage.getItem('itemThreshold')) {
    localStorage.setItem("itemThreshold", 0);
}
/*if (!localStorage.getItem('autoMineSkip')) {
    localStorage.setItem("autoMineSkip", 0);
}*/
mineState = JSON.parse(localStorage.getItem('autoMineState'));
smallRestoreState = JSON.parse(localStorage.getItem('autoSmallRestore'));
setThreshold = JSON.parse(localStorage.getItem('autoBuyThreshold'));
//autoMineSkip = JSON.parse(localStorage.getItem('autoMineSkip'));
sellTreasureState = JSON.parse(localStorage.getItem('autoSellTreasure'));
treasureHunter = JSON.parse(localStorage.getItem('treasureHunter'));
itemThreshold = JSON.parse(localStorage.getItem('itemThreshold'));

function loadScript() {
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function () {
        var result = oldInit.apply(this, arguments)
        initAutoMine()
        return result
    }
}

var scriptName = 'enhancedautomine'

if (document.getElementById('scriptHandler') != undefined) {
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) != null) {
        if (localStorage.getItem(scriptName) == 'true') {
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
