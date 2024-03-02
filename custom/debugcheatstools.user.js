// ==UserScript==
// @name          [Pokeclicker] Debug Cheats Tools
// @namespace     Pokeclicker Scripts
// @author        kevingrillet
// @description   Edit your save for debug (currency, gems, pokeballs, pokemons, ...)
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.0.2

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/debugcheatstools.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/debugcheatstools.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

// This script has many more cheats, but it's already too much... https://greasyfork.org/en/scripts/435557-pokeclicker

const profileDrop = document.getElementById('startMenu').querySelectorAll('ul li')[0];
const profileModal = document.getElementById('profileModal');

function getPokerusImgSrc(id, pkm){
    let lpkm = pkm || App.game.party.getPokemon(id);
    return lpkm?.pokerus || 0 > 0 ? (lpkm.pokerus === 3 ? "assets/images/breeding/pokerus/Resistant.png" : "assets/images/breeding/pokerus/Contagious.png") : "assets/images/breeding/pokerus/Infected.png";
}

function getPokeballImgSrc(id, pkm){
    let lpkm = pkm || App.game.party.getPokemon(id);
    return lpkm ? ((lpkm?.shiny === true) ? "assets/images/pokeball/Pokeball-shiny.svg" : "assets/images/pokeball/Pokeball.svg") : "assets/images/pokeball/None.svg";
}

// eslint-disable-next-line no-unused-vars
function gainPk(id){
    let lpkm = App.game.party.getPokemon(id);
    if (!lpkm)
        App.game.party.gainPokemonById(id)
    else if (!(lpkm?.shiny === true))
        App.game.party.gainPokemonById(id, true);
    document.querySelectorAll(`:scope #pkdx_${id.toString().replace('.','_')} img`)[1].src = getPokeballImgSrc(id, lpkm);
}

// eslint-disable-next-line no-unused-vars
function gainPkrs(id){
    let lpkm = App.game.party.getPokemon(id);
    if (!lpkm) return;
    lpkm.effortPoints = ((lpkm.pokerus < 2) ? 1 : 50) * 1000; // strange
    lpkm.pokerus = (lpkm.pokerus < 2) ? 2 : 3;
    document.querySelectorAll(`:scope #pkdx_${id.toString().replace('.','_')} img`)[2].src = getPokerusImgSrc(id, lpkm);
}

function filterPkdx(){
    let lst = document.querySelectorAll(':scope #pkdx tbody tr');
    for (let i = 0; i < lst.length; i++) {
        const tdb = lst[i];
        let display = true;

        if (document.getElementById('pkdxNameFilter').value !== ""){
            display = tdb.innerHTML.includes(document.getElementById('pkdxNameFilter').value);
        }

        if (display === true) {
            switch (document.getElementById('pkdxRegionFilter').value) {
                case 'all':
                    break;
                default:
                    display = tdb.innerHTML.toLowerCase().includes(document.getElementById('pkdxRegionFilter').value);
                    break;
            }
        }

        if (display === true) {
            switch (document.getElementById('pkdxShinyFilter').value) {
                case 'uncaught':
                    display = tdb.innerHTML.includes('None.svg');
                    break;
                case 'caught':
                    display = tdb.innerHTML.includes('Pokeball.svg') || tdb.innerHTML.includes('Pokeball-shiny.svg');
                    break;
                case 'caught-not-shiny':
                    display = tdb.innerHTML.includes('Pokeball.svg');
                    break;
                case 'caught-shiny':
                    display = tdb.innerHTML.includes('Pokeball-shiny.svg');
                    break;
                default:
                    break;
            }
        }

        if (display === true) {
            switch (document.getElementById('pkdxPKRSFilter').value) {
                case '0':
                    display = tdb.innerHTML.includes('Infected.png');
                    break;
                case '2':
                    display = tdb.innerHTML.includes('Contagious.png');
                    break;
                case '3':
                    display = tdb.innerHTML.includes('Resistant.png');
                    break;
                default:
                    break;
            }
        }

        tdb.style.display = (display === true ? "" : "none");
    }
}

function filterQuestLine(){
    let lst = document.querySelectorAll(':scope #questlinelist tbody tr');
    for (let i = 0; i < lst.length; i++) {
        const tdb = lst[i];
        let display = true;

        if (display === true) {
            switch (document.getElementById('questLineFilter').value) {
                case 'all':
                    break;
                default:
                    display = tdb.innerHTML.toLowerCase().includes(document.getElementById('questLineFilter').value);
                    break;
            }
        }

        tdb.style.display = (display === true ? "" : "none");
    }
}

// eslint-disable-next-line no-unused-vars
function loadPkdx(){
    let playerRegion = player.highestRegion();
    let pkdxBody = document.querySelector(':scope #pkdx tbody');
    pkdxBody.innerHTML = '';
    let toAdd = "";
    for (const pokemon of pokemonList) {
        if (pokemon.nativeRegion <= playerRegion) {
            let lpkm = App.game.party.getPokemon(pokemon.id);
            let region = GameConstants.Region[pokemon.nativeRegion].charAt(0).toUpperCase() + GameConstants.Region[pokemon.nativeRegion].slice(1)
            let hint = "";
            let getPokemonLocation = PokemonHelper.getPokemonLocations(pokemon.name, playerRegion);
            let roadLocations = getPokemonLocation[0]
            if (roadLocations) {
                for (let i = 0; i <= playerRegion; i++) {
                    const reg = GameConstants.Region[i];
                    let roads = "Route"
                    roadLocations[i]?.forEach((route) => {
                        roads += ` ${route.route},`
                    });
                    if (roads !== "Route")
                        hint += `${hint !== "" ? `\n` : ""}${reg.charAt(0).toUpperCase() + reg.slice(1)}: ${roads.slice(0, -1)}`;
                }
                if (hint !== "")
                    hint = ` title="${hint}"`;
            }
            toAdd += `
                <tr id="pkdx_${pokemon.id.toString().replace('.','_')}">
                    <td>${pokemon.id}</td>
                    <td>${region}</td>
                    <td><img class="smallImage" src="assets/images/pokemon/${pokemon.id}.png" alt=""></td>
                    <td>${pokemon.name}</td>
                    <td><img width="18px" src="${getPokeballImgSrc(pokemon.id, lpkm)}" onclick="gainPk(${pokemon.id})"/></td>
                    <td><img src="${getPokerusImgSrc(pokemon.id, lpkm)}"  onclick="gainPkrs(${pokemon.id})"/></td>
                    <td${hint}><span class="badge text-light" style="background-color: rgb(${Object.keys(getPokemonLocation).length ? ((hint !== "" ? (hint.includes(region) ? '122, 199, 76'  : '166, 185, 26' ) : '99, 144, 240') + ');">YES') : '194, 46, 40);">NO'}</span></td>
                </tr>
            `;
        }
    }
    pkdxBody.innerHTML = toAdd;
    filterPkdx();
}

function loadQuestLines() {
    let qlBody = document.querySelector(':scope #questlinelist tbody');
    qlBody.innerHTML = '';
    let toAdd = "";

    for (const ql of App.game.quests.questLines()) {
        let state = QuestLineState[ql.state()]
        state = state.charAt(0).toUpperCase() + state.slice(1)

        let stateColor;
        switch (ql.state()) {
            case 0:
                stateColor = "244, 80, 80";
                break;
            case 1:
                stateColor = "99, 144, 240";
                break;
            case 2:
                stateColor = "122, 199, 76";
                break;
        }

        toAdd += `
			<tr id="ql_${ql.name.toString().replace('.','_')}">
				<td>${ql.name}</td>
				<td><span class="badge text-light" style="background-color: rgb(${stateColor})">${state}</span></td>
			</tr>
		`;
    }

    // App.game.quests.questLines().filter(e => e.state() < 2).forEach(e => console.log(e.name, e.state()))

    qlBody.innerHTML = toAdd;
    filterQuestLine();
}

function initSaveEditor() {
    window.gainPk = gainPk;
    window.gainPkrs = gainPkrs;
    window.loadPkdx = loadPkdx;
    window.filterPkdx = filterPkdx;
    window.loadQuestLines = loadQuestLines;
    window.filterQuestLine = filterQuestLine;

    // Add menu item
    let eventLi = document.createElement('li');
    eventLi.innerHTML = `<a class="dropdown-item" href="#saveEditorModal" data-toggle="modal">Debug Cheats</a>`
    profileDrop.before(eventLi);

    // Add popup
    let eventMod = document.createElement('div');
    eventMod.setAttribute("class", "modal noselect fade show");
    eventMod.setAttribute("id", "saveEditorModal");
    eventMod.setAttribute("tabindex", "-1");
    eventMod.setAttribute("aria-labelledby", "saveEditorModal");
    eventMod.setAttribute("aria-modal", "true");
    eventMod.setAttribute("role", "dialog");

    eventMod.innerHTML = `
        <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header" style="justify-content: space-around;">
                    <h5 class="modal-title">Debug Cheats Tools</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-tabs nav-fill">
                        <li class="nav-item"><a data-toggle="tab" class="nav-link active" href="#currency">Currency</a></li>
                        <li class="nav-item"><a data-toggle="tab" class="nav-link" href="#gems">Gems</a></li>
                        <li class="nav-item"><a data-toggle="tab" class="nav-link" href="#pokeballs">Pokeballs</a></li>
                        <li class="nav-item"><a data-toggle="tab" class="nav-link" href="#berries">Berries</a></li>
                        <li class="nav-item"><a data-toggle="tab" class="nav-link" href="#evolutionitems">Evolution Items</a></li>
                        <li class="nav-item"><a data-toggle="tab" class="nav-link" href="#vitamins">Vitamins</a></li>
                        <li class="nav-item"><a data-toggle="tab" class="nav-link" href="#heldItems">Held items</a></li>
                        <li class="nav-item"><a data-toggle="tab" class="nav-link" href="#pokedex">Pokedex</a></li>
                        <li class="nav-item"><a data-toggle="tab" class="nav-link" href="#questlines">Quests</a></li>
                    </ul>
                    <div class="tab-content">
                        <div id="currency" class="tab-pane p-3 active">
                            <p>Click on button to add money (input * achievement bonus)</p>
                            <input id="inputAddCurrency" class="form-control" type="number" placeholder="1000000" value="1000000" min="0">
                        </div>
                        <div id="gems" class="tab-pane p-3">
                            <p>On click add gems (input)</p>
                            <input id="inputAddGems" class="form-control" type="number" placeholder="1000000" value="1000000" min="0">
                        </div>
                        <div id="pokeballs" class="tab-pane p-3">
                            <p>On click add pokeballs (input)</p>
                            <input id="inputAddPokeballs" class="form-control" type="number" placeholder="1000" value="1000" min="0">
                        </div>
                        <div id="berries" class="tab-pane p-3">
                            <p>On click add berries (input)</p>
                            <input id="inputAddBerries" class="form-control" type="number" placeholder="1000" value="1000" min="0">
                        </div>
                        <div id="evolutionitems" class="tab-pane p-3">
                            <p>On click add evolution items (input)</p>
                            <input id="inputAddEvolutionItems" class="form-control" type="number" placeholder="100" value="100" min="0">
                        </div>
                        <div id="vitamins" class="tab-pane p-3">
                            <p>On click add vitamins (input)</p>
                            <input id="inputAddVitamins" class="form-control" type="number" placeholder="100" value="100" min="0">
                        </div>
                        <div id="heldItems" class="tab-pane p-3">
                            <p>On click add held items items (input)</p>
                            <input id="inputAddHeldItems" class="form-control" type="number" placeholder="100" value="100" min="0">
                        </div>
                        <div id="pokedex" class="tab-pane p-3">
                            <p><b>You can break your game, please backup!</b></br><i>Do not complete pokedex from another region if you are not in the region you will not be able to go to the next region!</i></p>
                            <button class="btn btn-primary btn-block" onclick="loadPkdx()">(Re)Load Data</button>
                            <div class="form-row text-left">
                                <div class="form-group col-md-6 col-6">
                                    <label for="pkdxNameFilter">Name</label>
                                    <input id="pkdxNameFilter" class="form-control" placeholder="Bulbasaur" value="" oninput="filterPkdx()">
                                </div>
                                <div class="form-group col-md-6 col-6">
                                    <label for="pkdxRegionFilter">Region</label>
                                    <select id="pkdxRegionFilter" class="custom-select" oninput="filterPkdx()" style="margin-right: 8px">
                                        <option value="all" selected="true">All</option>
                                    </select>
                                </div>
                                <div class="form-group col-md-6 col-6">
                                    <label for="pkdxShinyFilter">Caught Status</label>
                                    <select id="pkdxShinyFilter" autocomplete="off" class="custom-select" onchange="filterPkdx()">
                                        <option value="all" selected="">All</option>
                                        <option value="uncaught">Uncaught</option>
                                        <option value="caught">Caught</option>
                                        <option value="caught-not-shiny">Caught not Shiny</option>
                                        <option value="caught-shiny">Caught Shiny</option>
                                    </select>
                                </div>
                                <div class="form-group col-md-6 col-6">
                                    <label for="pkdxPKRSFilter">Pokerus Status</label>
                                    <select id="pkdxPKRSFilter" autocomplete="off" class="custom-select" onchange="filterPkdx()">
                                        <option value="-1" selected="true">All</option>
                                        <option value="0">Uninfected</option>
                                        <option value="2">Contagious</option>
                                        <option value="3">Resistant</option>
                                    </select>
                                </div>
                            </div>
                            <table id="pkdx" class="table table-striped table-hover table-sm m-0">
                                <thead>
                                    <tr>
                                        <td>#ID</td>
                                        <td>Region</td>
                                        <td>Image</td>
                                        <td>Name</td>
                                        <td>Caught</td>
                                        <td>Pokerus</td>
                                        <td>Available</td>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                        <div id="questlines" class="tab-pane p-3">
                            <button class="btn btn-primary btn-block" onclick="loadQuestLines()">(Re)Load Data</button>
                            <div class="form-row text-left">
                                <div class="form-group col-md-6 col-6">
                                    <label for="questLineFilter">Quest Status</label>
                                    <select id="questLineFilter" autocomplete="off" class="custom-select" onchange="filterQuestLine()">
                                        <option value="all" selected="">All</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="started">Started</option>
                                        <option value="ended">Ended</option>
                                    </select>
                                </div>
                            </div>
                            <table id="questlinelist" class="table table-striped table-hover table-sm m-0">
                                <thead>
                                    <tr>
                                        <td>Name</td>
                                        <td>Status</td>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    profileModal.before(eventMod);

    let modalBody = document.querySelector('[id=saveEditorModal] div div [class=modal-body]');

    // currency
    for (let i = 0; i < Object.keys(GameConstants.Currency).filter(isNaN).length; i++) {
        const itm = GameConstants.Currency[i];
        const itmPretty = itm.charAt(0).toUpperCase() + itm.replace(/[A-Z]/g, ' $&').trim().slice(1);
        modalBody.querySelector('#currency').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="App.game.wallet.gain${itm.charAt(0).toUpperCase() + itm.slice(1)}${i > 0 ? "s" : ""}(parseInt(document.getElementById('inputAddCurrency').value || 0))">
                <img title="${itmPretty}" src="assets/images/currency/${itm}.svg" height="25px">
                <div>${itmPretty}</div>
            </div>
        `;
    }

    // gems
    for (let i = 0; i < Gems.nTypes; i++) {
        const itm = PokemonType[i];
        modalBody.querySelector('#gems').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="App.game.gems.gainGems(parseInt(document.getElementById('inputAddGems').value || 0), ${i})">
                <img title="${itm}" src="assets/images/gems/${itm} Gem.png" height="25px">
                <div>${itm}</div>
            </div>
        `;
    }

    // pokeballs
    for (let i = 0; i < Object.keys(GameConstants.Pokeball).filter(isNaN).length - 1; i++) {
        const itm = GameConstants.Pokeball[i];
        modalBody.querySelector('#pokeballs').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="App.game.pokeballs.gainPokeballs(${i}, parseInt(document.getElementById('inputAddPokeballs').value || 0), true)">
                <img title="${itm}" src="assets/images/pokeball/${itm}.svg" height="25px">
                <div>${itm}</div>
            </div>
        `;
    }

    // berries
    for (let i = 0; i < Object.keys(BerryType).filter(isNaN).length - 1; i++) {
        const itm = BerryType[i];
        modalBody.querySelector('#berries').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="App.game.farming.gainBerry(${i}, parseInt(document.getElementById('inputAddBerries').value || 0), true)">
                <img title="${itm}" src="assets/images/items/berry/${itm}.png" height="25px">
                <div>${itm}</div>
            </div>
        `;
    }

    // evolutionitems
    for (let i = 0; i < Object.keys(GameConstants.StoneType).filter(isNaN).length - 1; i++) {
        const itm = GameConstants.StoneType[i];
        const itmPretty = itm.replaceAll('_', ' ');
        modalBody.querySelector('#evolutionitems').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="player.gainItem(ItemList['${itm}'].name, parseInt(document.getElementById('inputAddEvolutionItems').value || 0), true)">
                <img title="${itmPretty}" src="assets/images/items/evolution/${itm}.png" height="25px">
                <div>${itmPretty}</div>
            </div>
        `;
    }

    // vitamins
    for (let i = 0; i < Object.keys(GameConstants.VitaminType).filter(isNaN).length; i++) {
        const itm = GameConstants.VitaminType[i];
        modalBody.querySelector('#vitamins').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="player.gainItem(ItemList['${itm}'].name, parseInt(document.getElementById('inputAddVitamins').value || 0), true)">
                <img title="${itm}" src="assets/images/items/vitamin/${itm}.png" height="25px">
                <div>${itm}</div>
            </div>
        `;
    }

    // heldItems
    HeldItem.getSortedHeldItems().forEach((itm, idx) => {
        const itmPretty = itm.name.replaceAll('_', ' ');
        modalBody.querySelector('#heldItems').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="HeldItem.getSortedHeldItems()[${idx}].gain(parseInt(document.getElementById('inputAddHeldItems').value || 0))">
                <img title="${itmPretty}" src="assets/images/items/heldItems/${itm.name}.png" height="25px">
                <div>${itmPretty}</div>
            </div>
        `;
    });

    // pokedex
    const pkdxRegFilt = modalBody.querySelector('#pkdxRegionFilter');
    for (let i = 0; i <= player.highestRegion(); i++) {
        const reg = GameConstants.Region[i]
        pkdxRegFilt.innerHTML += `<option value="${reg}">${reg.charAt(0).toUpperCase() + reg.slice(1)}</option>`;
    }
}

/* WIP, sevii helper
var lst = pokemonList.filter((p) => p.name.includes('Pinkan')
    || p.name.includes('Valencian')
    || p.name === 'Crystal Onix'
    || p.name === 'Ash\'s Butterfree'
    || p.name === 'Pink Butterfree');
var caught = App.game.party.caughtPokemon
    .filter((p) => p.name.includes('Pinkan')
    || p.name.includes('Valencian')
    || p.name === 'Crystal Onix'
    || p.name === 'Ash\'s Butterfree'
    || p.name === 'Pink Butterfree');

var caughtNames = caught.map(e => e.name);
var missing = lst.filter(e => !caughtNames.includes(e.name));

console.log(missing);
*/

function loadEpheniaScript(scriptName, initFunction) {
    const windowObject = !App.isUsingClient ? unsafeWindow : window;
    // Inject handlers if they don't exist yet
    if (windowObject.epheniaScriptInitializers === undefined) {
        windowObject.epheniaScriptInitializers = {};
        const oldInit = Preload.hideSplashScreen;
        var hasInitialized = false;

        // Initializes scripts once enough of the game has loaded
        Preload.hideSplashScreen = function (...args) {
            var result = oldInit.apply(this, args);
            if (App.game && !hasInitialized) {
                // Initialize all attached userscripts
                Object.entries(windowObject.epheniaScriptInitializers).forEach(([scriptName, initFunction]) => {
                    try {
                        initFunction();
                    } catch (e) {
                        console.error(`Error while initializing '${scriptName}' userscript:\n${e}`);
                        Notifier.notify({
                            type: NotificationConstants.NotificationOption.warning,
                            title: scriptName,
                            message: `The '${scriptName}' userscript crashed while loading. Check for updates or disable the script, then restart the game.\n\nReport script issues to the script developer, not to the Pokéclicker team.`,
                            timeout: GameConstants.DAY,
                        });
                    }
                });
                hasInitialized = true;
            }
            return result;
        }
    }

    // Prevent issues with duplicate script names
    if (windowObject.epheniaScriptInitializers[scriptName] !== undefined) {
        console.warn(`Duplicate '${scriptName}' userscripts found!`);
        Notifier.notify({
            type: NotificationConstants.NotificationOption.warning,
            title: scriptName,
            message: `Duplicate '${scriptName}' userscripts detected. This could cause unpredictable behavior and is not recommended.`,
            timeout: GameConstants.DAY,
        });
        let number = 2;
        while (windowObject.epheniaScriptInitializers[`${scriptName} ${number}`] !== undefined) {
            number++;
        }
        scriptName = `${scriptName} ${number}`;
    }
    // Add initializer for this particular script
    windowObject.epheniaScriptInitializers[scriptName] = initFunction;
}

if (!App.isUsingClient || localStorage.getItem('debugcheatstools') === 'true') {
    loadEpheniaScript('debugcheatstools', initSaveEditor);
}
