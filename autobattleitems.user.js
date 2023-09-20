// ==UserScript==
// @name          [Pokeclicker] Auto Battle Items
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   Automates the usage of Battle Items as effectively and efficiently as possible. Now includes which items you would like to automate specifically and being able to toggle them.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.1

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/autobattleitems.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/autobattleitems.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'autobattleitems';

var battleItemState;
var itemABLoop;
var ItemABPrefs;

function initAutoBattleItems() {
    const battleItemDisplay = document.getElementById('battleItemContainer');
    battleItemDisplay.querySelector('.card-header').outerHTML += `<button id= "auto-battle-items" class="btn btn-sm btn-${battleItemState ? 'success' : 'danger'}" style="position: absolute;left: 0px;top: 0px;width: 65px;height: 41px;font-size: 7pt;">
    Auto Use [${battleItemState ? 'ON' : 'OFF'}]
    </button>`
    document.getElementById('auto-battle-items').addEventListener('click', event => { switchABItems(event); });

    //Specific Battle Items Toggling
    const battleItemTop = battleItemDisplay.querySelectorAll('.amount.p-0');
    for (let i = 0; i < battleItemTop.length; i++) {
        battleItemTop[i].setAttribute('data-src', i);
        backColor(ItemABPrefs[i], battleItemTop[i]);
        battleItemTop[i].addEventListener('click', event => { toggleABItems(event); });
    }

    function toggleABItems(event) {
        const element = event.target;
        const index = +element.getAttribute('data-src');
        ItemABPrefs[index] = !ItemABPrefs[index];
        backColor(ItemABPrefs[index], element);
        localStorage.setItem("toggleABItems", JSON.stringify(ItemABPrefs));
    }

    function backColor(boolean, element) {
        boolean ? element.style.background = 'yellowgreen' : element.style.background = 'salmon';
    }

    function switchABItems(event) {
        const element = event.target;
        battleItemState = !battleItemState;
        battleItemState ? ABItems() : clearInterval(itemABLoop);
        element.setAttribute('class', `btn btn-${battleItemState ? 'success' : 'danger'}`);
        element.textContent = `Auto Use [${battleItemState ? 'ON' : 'OFF'}]`;
        localStorage.setItem('autoBattleItems', JSON.stringify(battleItemState));
    }

    function ABItems() {
        itemABLoop = setInterval(() => {
            //In order the towns required to be unlocked for each Battle Item
            const townReqs = ['Viridian City','Pewter City','Lavender Town'].flatMap(i => [i,i]);
            const battleItems = GameHelper.chunk(6, Object.keys(ItemList).filter(i=>ItemList[i].constructor.name == 'BattleItem'))[0];
            for (let i = 0; i < battleItems.length; i++) {
                if (ItemABPrefs[i]) {
                    const itemAmnt = player.itemList[battleItems[i]]();
                    const effectActive = player.effectList[battleItems[i]]();
                    const townUnlocked = TownList[townReqs[i]].isUnlocked();
                    if (townUnlocked) {
                        const getMoney = App.game.wallet.currencies[GameConstants.Currency.money]();
                        const basePrice = ItemList[battleItems[i]].basePrice;
                        const price = ItemList[battleItems[i]].price();
                        if (itemAmnt == 0 && basePrice == price && price <= getMoney) {
                            ItemList[battleItems[i]].buy(1);
                        }
                    }
                    if (itemAmnt != 0 && effectActive <= 1) {
                        ItemHandler.useItem(battleItems[i], 1);
                    }
                }
            }
        }, 500);
    }

    if (battleItemState) { ABItems(); }
}

if (!localStorage.getItem('autoBattleItems')) {
    localStorage.setItem("autoBattleItems", false);
}
if (!localStorage.getItem('toggleABItems')) {
    const prefArray = new Array(6).fill(false, 0, 6);
    localStorage.setItem("toggleABItems", JSON.stringify(prefArray));
}
battleItemState = JSON.parse(localStorage.getItem('autoBattleItems'));
ItemABPrefs = JSON.parse(localStorage.getItem('toggleABItems'));

function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args)
        if (App.game && !hasInitialized) {
            initAutoBattleItems();
            hasInitialized = true;
        }
        return result
    }
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
