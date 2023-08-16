// ==UserScript==
// @name          [Pokeclicker] Synthetic Shiny Synapse
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   Allows you to adjust and modify the shiny rates of everything specifically, as well as set a global shiny rate.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.5

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/syntheticshinysynapse.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/syntheticshinysynapse.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'syntheticshinysynapse';

const genSource = ['generateWildPokemon', //Wild Pokemon
                   'generateDungeonPokemon', //Dungeon Pokemon
                   'evolve', //Evolution Pokemon
                   'new', //Safari Pokemon
                   'claimFunction', //Shop/Claim/Gift Pokemon
                   'hatch', //Breeding/Eggs
                   'generateWanderPokemon', //Wandering/Farm Pokemon
                  ];
const genDesc = ['Wild Pokémon shiny odds:',
                 'Dungeon Pokémon shiny odds:',
                 'Evolution Stone Pokémon shiny odds:',
                 'Safari Pokémon shiny odds:',
                 'Gift/Claimed Pokémon shiny odds:',
                 'Breeding/Hatchery Pokémon shiny odds:',
                 'Wandering/Farm Pokémon shiny odds:'
                ];
var shinyTypes;
var shinyRates = [];
var prefShinyRates;
var globalShinyState;
var globalShinyRate;
var karmaMode;
var karmaRates;
var shinyDOMUpdate;

function initShinySynapse() {
    getShinyRates();

    const profileModal = document.getElementById('profileModal');
    const profileDrop = document.getElementById('startMenu').querySelectorAll('ul li')[0];
    const shinyLi = document.createElement('li');
    const a = document.createElement('a');
    a.setAttribute('class', 'dropdown-item');
    a.setAttribute('href', '#shinyModal');
    a.setAttribute('data-toggle', 'modal');
    a.textContent = 'Shiny Modifier';
    a.addEventListener('click', () => { updateShinyModal(); });
    shinyLi.appendChild(a);
    profileDrop.before(shinyLi);
    const shinyMod = document.createElement('div');
    shinyMod.setAttribute("class", "modal noselect fade show");
    shinyMod.setAttribute("id", "shinyModal");
    shinyMod.setAttribute("tabindex", "-1");
    shinyMod.setAttribute("aria-labelledby", "shinyModal");
    shinyMod.setAttribute("aria-labelledby", "shinyModal");
    shinyMod.setAttribute("aria-modal", "true");
    shinyMod.setAttribute("role", "dialog");

    shinyMod.innerHTML = `<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header" style="justify-content: space-around;">
            <h5 class="modal-title">Shiny Modifier</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
            </button>
        </div>
        <div class="modal-body">
        </div>
    </div>`

    profileModal.before(shinyMod);

    document.getElementById('shinyModal').querySelector('.modal-header').querySelector('h5').outerHTML += `
    <button id="shiny-rate-global" class="btn btn-${globalShinyState ? 'success' : 'danger'}" style="margin-left:20px;">
    Global Override [${globalShinyState ? 'ON' : 'OFF'}]
    </button>
    <button id="shiny-karma-mode" class="btn btn-${karmaMode ? 'success' : 'danger'}" style="margin-left:20px;">
    Karma Mode [${karmaMode ? 'ON' : 'OFF'}]
    </button>
    <button id="shiny-dom-update" class="btn btn-${shinyDOMUpdate ? 'success' : 'danger'}" style="margin-left:20px;">
    DOM Updates [${shinyDOMUpdate ? 'ON' : 'OFF'}]
    </button>
    <button id="shiny-rates-reset" class="btn btn-primary" style="margin-left:20px;">
    Reset Rates
    </button>`
    document.getElementById('shiny-rate-global').addEventListener('click', event => { globalToggle(event); });
    document.getElementById('shiny-karma-mode').addEventListener('click', event => { toggleKarma(event); });
    document.getElementById('shiny-dom-update').addEventListener('click', event => { toggleDOM(event); });
    document.getElementById('shiny-rates-reset').addEventListener('click', () => { resetRates(); });

    const modalBody = document.querySelector('[id=shinyModal] div div [class=modal-body]');
    const shinyMulti = App.game.multiplier.getBonus('shiny');
    const fragment = new DocumentFragment();

    const head = document.createElement('div');
    head.setAttribute('id', 'shiny-modifier-head');
    head.innerHTML = `<div>Category</div><div>✨Odds</div><div>✨Shiny Bonus</div><div></div>`;
    fragment.appendChild(head);

    const global = document.createElement('div');
    global.setAttribute('class', 'shiny-modifier-view');
    global.innerHTML = `<div>Global shiny odds:</div>`;
    const globalInput = document.createElement('input');
    globalInput.setAttribute('id', `shiny-modifier-global`);
    globalInput.setAttribute('type', 'text');
    globalInput.setAttribute('placeholder', `${globalShinyRate.toLocaleString('en-US')}`);
    globalInput.addEventListener('input', event => { checkInput(event); });
    global.appendChild(globalInput);
    const globalCharm = document.createElement('div');
    globalCharm.setAttribute('id', 'shiny-charm-rate-global');
    globalCharm.textContent = `${globalShinyRate / shinyMulti}`
    global.appendChild(globalCharm);
    const globalBtn = document.createElement('button');
    globalBtn.textContent = 'Modify';
    globalBtn.setAttribute('class', 'btn btn-sm btn-success');
    globalBtn.addEventListener('click', event => {
        const rate = +document.getElementById('shiny-modifier-global').value.replace(/[A-Za-z!@#$%^&*()]/g, '').replace(/[,]/g, "");
        const shinyMulti = App.game.multiplier.getBonus('shiny');
        globalShinyRate = rate;
        document.getElementById('shiny-charm-rate-global').textContent = (globalShinyRate / shinyMulti);
        localStorage.setItem("globalShinyRate", JSON.stringify(globalShinyRate));
    });
    global.appendChild(globalBtn);

    fragment.appendChild(global);

    for (let i = 0; i < shinyRates.length; i++) {
        const div = document.createElement('div');
        div.setAttribute('class', 'shiny-modifier-view');
        div.innerHTML = `<div>${genDesc[i]}</div>`;
        const input = document.createElement('input');
        input.setAttribute('id', `shiny-modifier-${i}`);
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', `${shinyRates[i].toLocaleString('en-US')}`);
        input.addEventListener('input', event => { checkInput(event); });
        div.appendChild(input);

        const charm = document.createElement('div');
        charm.setAttribute('id', `shiny-charm-rate-${i}`);
        charm.textContent = `${shinyRates[i] / shinyMulti}`
        div.appendChild(charm);

        const btn = document.createElement('button');
        btn.textContent = 'Modify';
        btn.setAttribute('class', 'btn btn-sm btn-success');
        btn.setAttribute('data-src', i);
        btn.addEventListener('click', event => {
            const index = +event.target.getAttribute('data-src');
            const rate = +document.getElementById(`shiny-modifier-${index}`).value.replace(/[A-Za-z!@#$%^&*()]/g, '').replace(/[,]/g, "");
            const shinyMulti = App.game.multiplier.getBonus('shiny');
            shinyRates[index] = rate;
            prefShinyRates[index] = rate;
            document.getElementById(`shiny-charm-rate-${index}`).textContent = (prefShinyRates[index] / shinyMulti);
            localStorage.setItem("shinySetRates", JSON.stringify(prefShinyRates));
        });
        div.appendChild(btn);

        fragment.appendChild(div);
    }
    modalBody.appendChild(fragment);

    PokemonFactory.generateShiny = function (chance, skipBonus = false) {
        let genType;
        try {
            const split = (new Error()).stack.split("\n")[2].trim().split(" ");
            genType = split[split.length - 2].replace(/^(.*?)[.]/, '');
        } catch (err) {
            genType = (new Error()).stack.split("\n")[1].trim().split(" ")[0].replace(/@(.*?)$/, '');
        }
        const index = genType == 'generateDungeonBoss' ? 1 : genSource.indexOf(genType);

        let trueChance;
        if (karmaMode) {
            trueChance = karmaRates[index];
            karmaRates[index] = karmaRates[index] - 1;
            localStorage.setItem('shinyKarmaRates', JSON.stringify(karmaRates));
        }
        else if (globalShinyState) {
            trueChance = globalShinyRate;
        } else if (prefShinyRates[index]) {
            trueChance = prefShinyRates[index];
        } else {
            trueChance = chance;
        }

        const bonus = skipBonus ? 1 : App.game.multiplier.getBonus('shiny');

        if (Rand.chance(trueChance / bonus)) {
            if (karmaMode) {
                karmaRates[index] = GameConstants[shinyTypes[index]]
                localStorage.setItem('shinyKarmaRates', JSON.stringify(karmaRates));
            }
            App.game.oakItems.use(OakItemType.Shiny_Charm);
            return true;
        }
        if (shinyDOMUpdate && $('#shinyModal').is(':visible')) {
            updateShinyModal();
        }
        return false;
    }

    addGlobalStyle('#shiny-modifier-head > div:nth-child(1) { width: 33% !important }');
    addGlobalStyle('#shiny-modifier-head * { width: 22% }');
    addGlobalStyle('#shiny-modifier-head { display: flex;flex-direction: row;margin-bottom: 14px;font-weight: bold;font-size: 1.1em; }');
    addGlobalStyle('.shiny-modifier-view { display: flex;flex-direction: row;justify-content: center;align-items: center;column-gap: 10px;margin-bottom: 2px; }');
    addGlobalStyle('.shiny-modifier-view > div:nth-child(1) { width: 33% !important }');
    addGlobalStyle('.shiny-modifier-view * { width: 22% }');

    function globalToggle(event) {
        const element = event.target;
        globalShinyState = !globalShinyState;
        element.setAttribute('class', `btn btn-${globalShinyState ? 'success' : 'danger'}`);
        element.textContent = `Global Override [${globalShinyState ? 'ON' : 'OFF'}]`;
        localStorage.setItem("globalShinyState", JSON.stringify(globalShinyState));
    }

    function toggleKarma(event) {
        const element = event.target;
        karmaMode = !karmaMode;
        element.setAttribute('class', `btn btn-${karmaMode ? 'success' : 'danger'}`);
        element.textContent = `Karma Mode [${karmaMode ? 'ON' : 'OFF'}]`;
        localStorage.setItem("shinyKarmaMode", JSON.stringify(karmaMode));
        updateShinyModal();
    }

    function toggleDOM(event) {
        const element = event.target;
        shinyDOMUpdate = !shinyDOMUpdate;
        element.setAttribute('class', `btn btn-${shinyDOMUpdate ? 'success' : 'danger'}`);
        element.textContent = `DOM Updates [${shinyDOMUpdate ? 'ON' : 'OFF'}]`;
        localStorage.setItem("shinyDOMUpdate", JSON.stringify(shinyDOMUpdate));
    }

    function resetRates() {
        const shinyMulti = App.game.multiplier.getBonus('shiny');

        globalShinyRate = 8192;
        localStorage.setItem("globalShinyRate", JSON.stringify(globalShinyRate));

        const shinyView = document.getElementsByClassName('shiny-modifier-view');
        for (let i = 0; i <= prefShinyRates.length; i++) {
            if (i == 8) {
                break;
            }
            if (i < 7) {
                prefShinyRates[i] = null;
            }
            if (0 == i) {
                shinyView[i].querySelector('input').value = globalShinyRate.toLocaleString('en-US');
                document.getElementById('shiny-charm-rate-global').textContent = (globalShinyRate / shinyMulti);
            } else {
                shinyRates[i - 1] = GameConstants[shinyTypes[i - 1]];
                shinyView[i].querySelector('input').value = shinyRates[i - 1].toLocaleString('en-US');
                document.getElementById(`shiny-charm-rate-${i - 1}`).textContent = (shinyRates[i - 1] / shinyMulti);
            }
        }
        localStorage.setItem("shinySetRates", JSON.stringify(prefShinyRates));
    }

    function checkInput(input) {
        const value = +event.target.value.replace(/[A-Za-z!@#$%^&*()]/g, '').replace(/[,]/g, "");
        event.target.value = value.toLocaleString('en-US');
    }

    function updateShinyModal() {
        const modifyBtns = document.getElementsByClassName('shiny-modifier-view');
        document.getElementById('shiny-modifier-global').disabled = karmaMode ? true : false;
        document.getElementById('shiny-rates-reset').disabled = karmaMode ? true : false;
        modifyBtns[0].querySelector('button').disabled = karmaMode ? true : false;
        for (let i = 0; i < shinyRates.length; i++) {
            document.getElementById(`shiny-modifier-${i}`).disabled = karmaMode ? true : false;
            document.getElementById(`shiny-modifier-${i}`).setAttribute('placeholder', `${karmaMode ? karmaRates[i].toLocaleString('en-US') : shinyRates[i].toLocaleString('en-US')}`);
            modifyBtns[i + 1].querySelector('button').disabled = karmaMode ? true : false;
        }
        const shinyMulti = App.game.multiplier.getBonus('shiny');
        for (let ii = 0; ii < shinyRates.length; ii++) {
            document.getElementById(`shiny-charm-rate-${ii}`).textContent = karmaMode ? (karmaRates[ii] / shinyMulti) : (shinyRates[ii] / shinyMulti);
        }
    }
}

function getShinyTypes() {
    const shinyTypeData = Object.keys(GameConstants).filter(e => e.includes('SHINY_CHANCE'));
    return shinyTypeData;
}

function getShinyRates() {
    for (let i = 0; i < shinyTypes.length; i++) {
        if (prefShinyRates[i]) {
            shinyRates.push(prefShinyRates[i]);
        } else {
            shinyRates.push(GameConstants[shinyTypes[i]]);
        }
    }
}

shinyTypes = getShinyTypes();
if (!localStorage.getItem('globalShinyState')) {
    localStorage.setItem('globalShinyState', false);
}
if (!localStorage.getItem('globalShinyRate')) {
    localStorage.setItem('globalShinyRate', 8192);
}
if (!localStorage.getItem('shinySetRates')) {
    const prefArray = new Array(shinyTypes.length).fill(null, 0, shinyTypes.length);
    localStorage.setItem('shinySetRates', JSON.stringify(prefArray));
}
if (!localStorage.getItem('shinyKarmaMode')) {
    localStorage.setItem('shinyKarmaMode', false);
}
if (!localStorage.getItem('shinyKarmaRates')) {
    const karmaRates = [];
    shinyTypes.forEach(item => { karmaRates.push(GameConstants[item]) });
    localStorage.setItem('shinyKarmaRates', JSON.stringify(karmaRates));
}
if (!localStorage.getItem('shinyDOMUpdate')) {
    localStorage.setItem('shinyDOMUpdate', false);
}
globalShinyState = JSON.parse(localStorage.getItem('globalShinyState'));
globalShinyRate = JSON.parse(localStorage.getItem('globalShinyRate'));
prefShinyRates = JSON.parse(localStorage.getItem('shinySetRates'));
karmaMode = JSON.parse(localStorage.getItem('shinyKarmaMode'));
karmaRates = JSON.parse(localStorage.getItem('shinyKarmaRates'));
shinyDOMUpdate = JSON.parse(localStorage.getItem('shinyDOMUpdate'));

function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args);
        if (App.game && !hasInitialized) {
            initShinySynapse();
            hasInitialized = true;
        }
        return result;
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
