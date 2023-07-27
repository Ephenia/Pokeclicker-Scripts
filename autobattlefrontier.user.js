// ==UserScript==
// @name          [Pokeclicker] Auto Battle Frontier
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Credit: andrew951)
// @description   Adds in stage resetting to the Battle Frontier that allows you to set a target stage and infinitely farm the Battle Frontier while being fully AFK. Also, gives the appropriate amount of Battle Points and Money without needing to fail and lose a stage.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.5

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/autobattlefrontier.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/autobattlefrontier.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'autobattlefrontier';

class AutoBattleFrontier {
    static battleFrontCeil;
    static bfOneClickState;

    static {
        if (localStorage.getItem('battleFrontCeil') == null) {
            localStorage.setItem("battleFrontCeil", 0);
        }
        if (localStorage.getItem('bfOneClickState') == null) {
            localStorage.setItem("bfOneClickState", false);
        }
        this.battleFrontCeil = +localStorage.getItem('battleFrontCeil');
        if (!(Number.isInteger(this.battleFrontCeil) && this.battleFrontCeil > 0)) {
            this.battleFrontCeil = 0;
        }
        this.bfOneClickState = localStorage.getItem('bfOneClickState');
        if (typeof this.bfOneClickState !== 'boolean') {
            this.bfOneClickState = false;
        }
    }

    static initAutoBattleFrontier() {
        AutoBattleFrontier.overrideGameMethods();

        const bfStart = document.querySelector('#battleFrontierInformation a[onclick="BattleFrontierRunner.start(false)"]');
        bfStart.setAttribute('onclick', 'BattleFrontierRunner.start(true)');
        const bfQuit = document.querySelector('#battleFrontierInformation a[onclick="BattleFrontierRunner.battleQuit()"]');
        bfQuit.setAttribute('onclick', 'BattleFrontierRunner.end()');

        let bfOneClickColor = (this.bfOneClickState ? 'success' : 'danger');
        
        const battleFrontTitle = document.querySelector('#battleFrontierInformation div.card-header');
        const oneClickBtn = document.createElement("div");
        oneClickBtn.setAttribute("id", "bf-one-click-btn");
        oneClickBtn.innerHTML = `<button id="bf-one-click-start" class="btn btn-block btn-`+ bfOneClickColor + `" style="font-size: 8pt;">One Click Attack [${this.bfOneClickState ? 'ON' : 'OFF'}]</button>`
        oneClickBtn.setAttribute('onclick', 'AutoBattleFrontier.toggleOneClick()');
        const bfInput = document.createElement("div");
        bfInput.setAttribute("id", "battle-front-cont");
        bfInput.innerHTML = `Max Stage: <input id="battle-front-input" style="width: 70px;"> <button id="battle-front-input-submit" class="btn btn-block btn-danger" style="font-size: 8pt; width: 42px; display:inline-block;">OK</button>`
        battleFrontTitle.before(bfInput);
        battleFrontTitle.before(oneClickBtn);
        document.getElementById('battle-front-input').value = this.battleFrontCeil.toLocaleString('en-US');
        document.getElementById('battle-front-input-submit').setAttribute('onclick', 'AutoBattleFrontier.setBattleFrontCeil()');

        addGlobalStyle('#battle-front-cont { position:absolute;right:5px;top:5px;width:auto;height:41px; }');
        addGlobalStyle('#bf-one-click-btn { position:absolute;left:5px;top:5px;width:auto;height:41px; }');
    }

    static overrideGameMethods() {
        const oldNextStage = BattleFrontierRunner.nextStage;
        BattleFrontierRunner.nextStage = function() {
            var result = oldNextStage.apply(this, arguments);
            // Stage ceiling check
            if (!AutoBattleFrontier.bfOneClickState && AutoBattleFrontier.battleFrontCeil > 0) {
                if (BattleFrontierRunner.stage() > AutoBattleFrontier.battleFrontCeil) {
                    AutoBattleFrontier.battleReset();
                }
            }
            return result;
        }

        const oldPokemonAttack = BattleFrontierBattle.pokemonAttack;
        BattleFrontierBattle.pokemonAttack = function() {
            // One Click check
            if (AutoBattleFrontier.bfOneClickState) {
                // Safety check the enemy exists (relevant for exiting the frontier)
                if (BattleFrontierBattle.enemyPokemon() && 
                    Battle.enemyPokemon().maxHealth() > App.game.party.calculatePokemonAttack(Battle.enemyPokemon().type1, Battle.enemyPokemon().type2, true)) {
                        AutoBattleFrontier.battleReset();
                    }
                }
            }
            return oldPokemonAttack.apply(this, arguments);
        }
    }

    static battleReset() {
        // Current stage - 1 as the player didn't beat the current stage
        var stageBeaten = BattleFrontierRunner.stage() - 1;
        if (stageBeaten > 0) {
            // Give Battle Points and Money based on how far the user got
            const battleMultiplier = Math.max(stageBeaten / 100, 1);
            let battlePointsEarned = Math.round(stageBeaten * battleMultiplier);
            let moneyEarned = stageBeaten * 100 * battleMultiplier;

            // Award battle points and dollars and retrieve their computed values
            battlePointsEarned = App.game.wallet.gainBattlePoints(battlePointsEarned).amount;
            moneyEarned = App.game.wallet.gainMoney(moneyEarned, true).amount;

            Notifier.notify({
                title: 'Battle Frontier',
                message: `You managed to beat stage ${stageBeaten.toLocaleString('en-US')}.\nYou received <img src="./assets/images/currency/battlePoint.svg" height="24px"/> ${battlePointsEarned.toLocaleString('en-US')}.\nYou received <img src="./assets/images/currency/money.svg" height="24px"/> ${moneyEarned.toLocaleString('en-US')}.`,
                strippedMessage: `You managed to beat stage ${stageBeaten.toLocaleString('en-US')}.\nYou received ${battlePointsEarned.toLocaleString('en-US')} Battle Points.\nYou received ${moneyEarned.toLocaleString('en-US')} Pokédollars.`,
                type: NotificationConstants.NotificationOption.success,
                setting: NotificationConstants.NotificationSetting.General.battle_frontier,
                sound: NotificationConstants.NotificationSound.General.battle_frontier,
                timeout: 30 * GameConstants.SECOND,
            });
            App.game.logbook.newLog(
                LogBookTypes.FRONTIER,
                createLogContent.gainBattleFrontierPoints({
                    stage: stageBeaten.toLocaleString('en-US'),
                    points: battlePointsEarned.toLocaleString('en-US'),
                })
            );
        }
        // Back to the start
        BattleFrontierRunner.stage(1);
        BattleFrontierRunner.checkpoint(1);
        BattleFrontierBattle.pokemonIndex(0);
        BattleFrontierBattle.generateNewEnemy();
    }

    static toggleOneClick() {
        this.bfOneClickState = !this.bfOneClickState;
        if (this.bfOneClickState) {
            document.getElementById("bf-one-click-start").classList.remove('btn-danger');
            document.getElementById("bf-one-click-start").classList.add('btn-success');
        } else {
            document.getElementById("bf-one-click-start").classList.remove('btn-success');
            document.getElementById("bf-one-click-start").classList.add('btn-danger');
        }
        localStorage.setItem("bfOneClickState", this.bfOneClickState);
        document.getElementById('bf-one-click-start').innerHTML = `One Click [${this.bfOneClickState ? 'ON' : 'OFF'}]`;
    }

    static setBattleFrontCeil() {
        let inputVal = +document.getElementById('battle-front-input').value.replace(/,/g, '');
        this.battleFrontCeil = (Number.isInteger(inputVal) && inputVal > 0 ? inputVal : 0);
        localStorage.setItem("battleFrontCeil", this.battleFrontCeil);
        document.getElementById('battle-front-input').value = this.battleFrontCeil.toLocaleString('en-US');
    }
}

function loadScript() {
    AutoBattleFrontier.initAutoBattleFrontier();
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
