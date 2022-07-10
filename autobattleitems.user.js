// ==UserScript==
// @name        [Pokeclicker] Auto Battle Items
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.0
// @author      Ephenia
// @description Automates the usage of Battle Items as effectively and efficiently as possible.
// @updateURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/autobattleitems.user.js
// ==/UserScript==

var battleItemState;
var itemABLoop;

function initAutoBattleItems() {
    const battleItemDisplay = document.getElementById('battleItemContainer');
    battleItemDisplay.querySelector('.card-header').outerHTML += `<button id= "auto-battle-items" class="btn btn-sm btn-${battleItemState ? 'success' : 'danger'}" style="position: absolute;left: 0px;top: 0px;width: 65px;height: 41px;font-size: 7pt;">
    Auto Use [${battleItemState ? 'ON' : 'OFF'}]
    </button>`
    document.getElementById('auto-battle-items').addEventListener('click', event => { toggleABItems(event); });

    function toggleABItems(event) {
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
        }, 500);
    }

    if (battleItemState) { ABItems(); }
}

if (!localStorage.getItem('autoBattleItems')) {
    localStorage.setItem("autoBattleItems", false);
}
battleItemState = JSON.parse(localStorage.getItem('autoBattleItems'));

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initAutoBattleItems()
        return result
    }
}

var scriptName = 'autobattleitems'

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
