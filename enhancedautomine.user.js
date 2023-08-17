// ==UserScript==
// @name          [Pokeclicker] Enhanced Auto Mine
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Credit: falcon71, KarmaAlex, umbralOptimatum, Pastaficionado)
// @description   Automatically mines the Underground with Bombs. Features adjustable settings as well.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       2.2.1

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautomine.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/enhancedautomine.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'enhancedautomine';

var mineState;
var smallRestoreState;
var setThreshold;
var autoMineTimer;
var layersMined;
var sellTreasureState;
var treasureHunter;
var itemThreshold;

function initAutoMine() {
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
  <option value="4">Mega Stones</option>
  <option value="5">Diamond Value</option>
</select>
<div id="item-threshold-input" class="col-12 col-md-2 btn-secondary"><img id="treasure-image" src="assets/images/currency/money.svg" height="25px">
<input title="Skips layers with fewer target items than this value." type="text" id="item-threshold"></div>`
    document.querySelectorAll('#mineBody + div')[0].prepend(minerHTML);
    $("#auto-mine-start").unwrap();
    document.getElementById('small-restore').value = setThreshold.toLocaleString('en-US');
    document.getElementById('treasure-hunter').value = treasureHunter;
    document.getElementById('item-threshold').value = itemThreshold.toLocaleString('en-US');
    setTreasureImage();
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

    addGlobalStyle('#threshold-input { display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:space-evenly;align-items:center; }');
    addGlobalStyle('#item-threshold-input { display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:space-evenly;align-items:center; }');
    addGlobalStyle('#small-restore { width:150px; }');
    addGlobalStyle('#item-threshold { width:75px; }');

    if (mineState) {
        autoMineTimer = setInterval(function () {
            doAutoMine();
        }, 1000);
    }
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
        clearInterval(autoMineTimer)
    }
    localStorage.setItem('autoMineState', mineState);
}

function doAutoMine() {
    const treasureHunting = Math.sign(treasureHunter) >= 0 && itemThreshold > 0;
    const treasureTypes = ['Fossils', 'Evolution Items', 'Gem Plates', 'Shards', 'Mega Stones', 'Diamond Value'];
    const surveyResult = Mine.surveyResult();
    let treasureAmount;
    if (Mine.loadingNewLayer) {
        // Do nothing while the new layer is loading
        return;
    }
    if (treasureHunting && surveyResult) {
        // Parse survey for the treasure type we want
        try {
            let re = new RegExp(String.raw`${treasureTypes[treasureHunter]}: (\d+)`);
            treasureAmount = +re.exec(surveyResult)[1];
            // Count fossil pieces as fossils
            if (treasureHunter == 0) {
              re = new RegExp(`Fossil Pieces: (\d+)`);
              treasureAmount += +re.exec(surveyResult)[1];
            }
        } catch (err) {
            treasureAmount = 0;
        }
    }
    if (treasureHunting && !surveyResult) {
        // Survey the layer
        mineMain();
    } else if (treasureHunting && treasureAmount < itemThreshold && Mine.skipsRemaining() > 0) {
        // Too few of the desired treasure type, skip
        resetLayer();
    } else if (!treasureHunting && Mine.itemsBuried() < itemThreshold && Mine.skipsRemaining() > 0) {
        // Too few items, skip
        resetLayer();
    } else {
        // Either the layer meets requirements or we're out of skips
        mineMain();
    }
    if (sellTreasureState && layersMined != App.game.statistics.undergroundLayersMined()) {
        Underground.sellAllMineItems();
        layersMined = JSON.stringify(App.game.statistics.undergroundLayersMined());
        localStorage.setItem('undergroundLayersMined', layersMined);
    }

    function mineMain() {
        if (smallRestoreState) {
            if ((ItemList["SmallRestore"].price() == 30000) && (player.itemList["SmallRestore"]() == 0) && (App.game.wallet.currencies[GameConstants.Currency.money]() >= setThreshold + 30000)) {
                ItemList["SmallRestore"].buy(1);
            }
            if (Math.floor(App.game.underground.energy) < Math.max(App.game.underground.getSurvey_Cost(), Underground.BOMB_ENERGY)) {
                if (player.itemList["LargeRestore"]() > 0) {
                    ItemList["LargeRestore"].use();
                } else if (player.itemList["MediumRestore"]() > 0) {
                    ItemList["MediumRestore"].use();
                } else {
                    ItemList["SmallRestore"].use();
                }
            }
        }
        if (!surveyResult && treasureHunting && Mine.skipsRemaining() != 0) {
            if (Math.floor(App.game.underground.energy) >= App.game.underground.getSurvey_Cost()) {
                Mine.survey();
                $('#mine-survey-result').tooltip("hide");
            }
            return true;
        } else {
            if (Math.floor(App.game.underground.energy) >= 1) {
                // Get location of all reward tiles
                let rewards = Mine.rewardGrid.flatMap((row, y) => {
                    return row.map((tile, x) => {
                        return (tile ? {item: tile.value, revealed: tile.revealed, 'x': x, 'y': y} : 0);
                    }).filter((tile) => tile != 0);
                });
                // Calculate number of distinct items visible
                let rewardsSeen = new Set();
                rewards.forEach((tile) => {
                    if (tile.revealed) {
                        rewardsSeen.add(tile.item);
                    }
                });
                if (Mine.itemsBuried() > rewardsSeen.size) {
                    // Use bombs while there are still items left to uncover
                    if (Math.floor(App.game.underground.energy) >= Underground.BOMB_ENERGY) {
                        Mine.bomb();
                    }
                } else {
                    // All items have at least one tile revealed, let's excavate them
                    if (Mine.toolSelected() != 0) {
                        Mine.toolSelected(Mine.Tool.Chisel);
                    }
                    let tilesToMine = rewards.filter((tile) => rewardsSeen.has(tile.item) && !tile.revealed)
                    while (tilesToMine.length && Math.floor(App.game.underground.energy) >= Underground.CHISEL_ENERGY) {
                        let tile = tilesToMine.pop();
                        Mine.click(tile.y, tile.x);
                    }
                }
            }
        }
    }

    function resetLayer() {
        if (!Mine.loadingNewLayer) {
            Mine.loadingNewLayer = true;
            setTimeout(Mine.completed, 1500);
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
        'items/underground/Flame Plate.png', 'items/underground/Red Shard.png', 'megaStone/142.png', 'currency/diamond.svg'];
    const imageTitles = ['Item', 'Fossil', 'Evolution Stone', 'Plate', 'Shard', 'Mega Stone', 'Diamond'];
    document.getElementById('treasure-image').src = `assets/images/${imageSources[1 + treasureHunter]}`;
    document.getElementById('treasure-image').title = imageTitles[1 + treasureHunter];
}

if (!validParse(localStorage.getItem('autoMineState'))) {
    localStorage.setItem("autoMineState", false);
}
if (!validParse(localStorage.getItem('autoSmallRestore'))) {
    localStorage.setItem("autoSmallRestore", false);
}
if (!validParse(localStorage.getItem('autoBuyThreshold'))) {
    localStorage.setItem("autoBuyThreshold", 0);
}
if (!validParse(localStorage.getItem('autoSellTreasure'))) {
    localStorage.setItem("autoSellTreasure", false);
}
if (!validParse(localStorage.getItem('treasureHunter'))) {
    localStorage.setItem("treasureHunter", -1);
}
if (!validParse(localStorage.getItem('itemThreshold'))) {
    localStorage.setItem("itemThreshold", 0);
}
mineState = JSON.parse(localStorage.getItem('autoMineState'));
smallRestoreState = JSON.parse(localStorage.getItem('autoSmallRestore'));
setThreshold = JSON.parse(localStorage.getItem('autoBuyThreshold'));
sellTreasureState = JSON.parse(localStorage.getItem('autoSellTreasure'));
treasureHunter = JSON.parse(localStorage.getItem('treasureHunter'));
itemThreshold = JSON.parse(localStorage.getItem('itemThreshold'));

function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args);
        if (App.game && !hasInitialized) {
            initAutoMine();
            hasInitialized = true;
        }
        return result;
    }
}

function validParse(key) {
    try {
        if (key === null) {
            throw new Error;
        }
        JSON.parse(key);
        return true;
    } catch (e) {
        return false;
    }
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

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
