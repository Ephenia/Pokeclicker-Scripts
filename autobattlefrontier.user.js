// ==UserScript==
// @name          [Pokeclicker] Auto Battle Frontier
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Credit: andrew951)
// @description   Adds in stage resetting to the Battle Frontier that allows you to set a target stage and infinitely farm the Battle Frontier while being fully AFK. Also, gives the appropriate amount of Battle Points and Money without needing to fail and lose a stage.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.4

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/autobattlefrontier.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/autobattlefrontier.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var awaitFloorReset;
var existHTML = false;
var battleFrontFloor;
var bfOneClickState;
var bfOneClickColor;
var bpImg = `<img src="assets/images/currency/battlePoint.svg" height="25px">`
var moneyImg = `<img src="assets/images/currency/money.svg" height="25px">`

function initBattleFrontier() {
    addGlobalStyle('#battle-front-cont { position:absolute;right:5px;top:5px;width:auto;height:41px; }');
    addGlobalStyle('#bf-one-click-btn { position:absolute;left:5px;top:5px;width:auto;height:41px; }');

    const middleCol = document.getElementById('middle-column');
    //If you initially load the game and are at the Battle Frontier entry, to keep things smooth
    checkBattleFrontierEntry();

    middleCol.addEventListener('click', event => {
        checkBattleFrontierEntry();
        if (BattleFrontierRunner.started() && existHTML) {
            //console.log("already started")
        }
        if (BattleFrontierRunner.started() && !existHTML) {
            existHTML = true;
            createHTML();
            floorReset();
            //console.log("starting")
        }
    });

    function checkBattleFrontierEntry() {
        const bfEnter = $( "button:contains('Enter Battle Frontier')" );
        if (bfEnter.is(":visible")) {
            bfEnter[0].addEventListener('click', () => {
                modifyBattleFrontier();
            });
        }
    }

    function modifyBattleFrontier() {
        const middleCol = document.getElementById('middle-column');
        const bfStartNew = middleCol.querySelector('[onclick="BattleFrontierRunner.start(false)"]');
        bfStartNew.setAttribute('onclick', 'BattleFrontierRunner.start(true)');
        bfStartNew.textContent = 'Start (Stage: 0)';
    }

    function floorReset() {
        awaitFloorReset = setInterval(function () {
            if (BattleFrontierRunner.started()) {
                if(bfOneClickState === "ON") {
                    oneClick();
                } else {
                    if (BattleFrontierRunner.stage() > battleFrontFloor && battleFrontFloor > 0) {
                        battleReset();
                        BattleFrontierRunner.stage(1);
                    }
                }
            } else {
                existHTML = false;
                document.getElementById('battle-front-cont').remove();
                document.getElementById('bf-one-click-btn').remove();
                clearInterval(awaitFloorReset);
            }
        }, 50);
    }

    function createHTML() {
        if (bfOneClickState == "OFF") {
            bfOneClickColor = "danger"
        } else {
            bfOneClickColor = "success"
        }
        const battleFrontInfo = document.getElementById('battleFrontierInformation');
        const battleFrontTitle = battleFrontInfo.querySelector('div');
        const oneClickBtn = document.createElement("div");
        oneClickBtn.setAttribute("id", "bf-one-click-btn");
        oneClickBtn.innerHTML = `<button id="bf-one-click-start" class="btn btn-block btn-`+ bfOneClickColor + `" style="font-size: 8pt;">One Click Attack [`+ bfOneClickState + `]</button>`
        oneClickBtn.addEventListener('click', event => { toggleOneClick() })
        const bfInput = document.createElement("div");
        bfInput.setAttribute("id", "battle-front-cont");
        bfInput.innerHTML = `Max Stage: <input id="battle-front-input" style="width: 70px;"> <button id="battle-front-input-submit" class="btn btn-block btn-danger" style="font-size: 8pt; width: 42px; display:inline-block;">OK</button>`
        battleFrontTitle.before(bfInput);
        battleFrontTitle.before(oneClickBtn);
        document.getElementById('battle-front-input').value = battleFrontFloor.toLocaleString('en-US');
        document.querySelector('#battle-front-input-submit').addEventListener('click', event => {
            battleFrontFloor = +document.getElementById('battle-front-input').value.replace(/[A-Za-z!@#$%^&*()]/g, '').replace(/[,]/g, "");
            localStorage.setItem("battleFrontFloor", battleFrontFloor);
            document.getElementById('battle-front-input').value = battleFrontFloor.toLocaleString('en-US');
        });
        const bfQuit = battleFrontInfo.querySelector('[onclick="BattleFrontierRunner.battleQuit()"]');
        bfQuit.setAttribute('onclick', 'BattleFrontierRunner.end()');
        bfQuit.addEventListener('click', () => {modifyBattleFrontier();});
    }

    function battleReset() {
        // Current stage - 1 as the player didn't beat the current stage
        var stageBeaten = BattleFrontierRunner.stage() - 1;
        if (stageBeaten > 0) {
            // Give Battle Points and Money based on how far the user got
            var battleMultiplier = Math.max(stageBeaten / 100, 1);
            var battlePointsEarned = Math.round(stageBeaten * battleMultiplier);
            var moneyEarned = stageBeaten * 100 * battleMultiplier;
            //notification popup
            Notifier.notify({
                title: 'Battle Frontier',
                message: `You managed to beat stage ` + stageBeaten + `.<br/>You received ` + bpImg + battlePointsEarned.toLocaleString() + ` BP<br>You recieved ` + moneyImg + moneyEarned.toLocaleString() + ` money.`,
                type: NotificationConstants.NotificationOption.success,
            });
            // Award battle points and money
            App.game.wallet.gainBattlePoints(battlePointsEarned);
            App.game.wallet.gainMoney(moneyEarned);
        }
    }

    function toggleOneClick() {
        if (bfOneClickState == "OFF") {
            bfOneClickState = "ON"
            document.getElementById("bf-one-click-start").classList.remove('btn-danger');
            document.getElementById("bf-one-click-start").classList.add('btn-success');
        } else {
            bfOneClickState = "OFF"
            document.getElementById("bf-one-click-start").classList.remove('btn-success');
            document.getElementById("bf-one-click-start").classList.add('btn-danger');
        }
        localStorage.setItem("bfOneClickState", bfOneClickState);
        document.getElementById('bf-one-click-start').innerHTML = `One Click [` + bfOneClickState + `]`
    }

    function oneClick() {
        if(Battle.enemyPokemon().maxHealth() > App.game.party.calculatePokemonAttack(
            Battle.enemyPokemon().type1,
            Battle.enemyPokemon().type2, true,)
          ) {
            battleReset();
            BattleFrontierRunner.stage(1);
        }
    }

}

if (localStorage.getItem('battleFrontFloor') == null) {
    localStorage.setItem("battleFrontFloor", 0);
}
if (localStorage.getItem('bfOneClickState') == null) {
    localStorage.setItem("bfOneClickState", "OFF");
}
battleFrontFloor = +localStorage.getItem('battleFrontFloor');
bfOneClickState = localStorage.getItem('bfOneClickState');

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initBattleFrontier()
        return result
    }
}

var scriptName = 'autobattlefrontier'

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
