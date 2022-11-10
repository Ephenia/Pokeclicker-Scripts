// ==UserScript==
// @name          [Pokeclicker] Debug Cheats Tools
// @namespace     Pokeclicker Scripts
// @author        kevingrillet
// @description   Edit your save for debug (currency, gems, pokeballs, pokemons, ...)
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/debugcheats.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/debugcheats.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
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

function initSaveEditor() {
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
                        <li class="nav-item"><a data-toggle="tab" class="nav-link" href="#evolutionitems">Evolution Items</a></li>
                        <li class="nav-item"><a data-toggle="tab" class="nav-link" href="#pokedex">Pokedex</a></li>
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

                        <div id="evolutionitems" class="tab-pane p-3">
                            <p>On click add evolution items (input)</p>
                            <input id="inputAddEvolutionItems" class="form-control" type="number" placeholder="100" value="100" min="0">
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
                    </div>
                </div>
            </div>
        </div>
    `;

    profileModal.before(eventMod);

    let modalBody = document.querySelector('[id=saveEditorModal] div div [class=modal-body]');

    // currency
    for (let i = 0; i <= 5; i++) {
        const curr = GameConstants.Currency[i];
        modalBody.querySelector('#currency').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="App.game.wallet.gain${curr.charAt(0).toUpperCase() + curr.slice(1)}${i > 0 ? "s" : ""}(parseInt(document.getElementById('inputAddCurrency').value || 0))">
                <img title="${curr.charAt(0).toUpperCase() + curr.replace(/[A-Z]/g, ' $&').trim().slice(1)}" src="assets/images/currency/${curr}.svg" height="25px">
            </div>
        `;
    }

    // gems
    for (let i = 0; i < Gems.nTypes; i++) {
        const pt = PokemonType[i];
        modalBody.querySelector('#gems').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="App.game.gems.gainGems(parseInt(document.getElementById('inputAddGems').value || 0), ${i})">
                <img title="${pt}" src="assets/images/gems/${pt} Gem.png" height="25px">
                <div>${pt}</div>
            </div>
        `;
    }

    // pokeballs
    for (let i = 0; i <= 13; i++) {
        const pkb = GameConstants.Pokeball[i];
        modalBody.querySelector('#pokeballs').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="App.game.pokeballs.gainPokeballs(${i}, parseInt(document.getElementById('inputAddPokeballs').value || 0), true)">
                <img title="${pkb}" src="assets/images/pokeball/${pkb}.svg" height="25px">
                <div>${pkb}</div>
            </div>
        `;
    }

    // evolutionitems
    for (let i = 0; i<= 38; i++) {
        const st = GameConstants.StoneType[i];
        modalBody.querySelector('#evolutionitems').innerHTML += `
            <div class="btn btn-primary col-2 item-bag-item" onclick="player.gainItem(ItemList['${st}'].name, parseInt(document.getElementById('inputAddEvolutionItems').value || 0), true)">
                <img title="${st}" src="assets/images/items/evolution/${st}.png" height="25px">
            </div>
        `;
    }

    // pokedex
    const regFilt = modalBody.querySelector('#pkdxRegionFilter');
    for (let i = 0; i <= player.highestRegion(); i++) {
        const reg = GameConstants.Region[i]
        regFilt.innerHTML += `<option value="${reg}">${reg.charAt(0).toUpperCase() + reg.slice(1)}</option>`;
    }
}

// initSaveEditor();

//Made this script load like the others for consistency
function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initSaveEditor()
        return result
    }
}

var scriptName = 'debugcheatstools'

if (document.getElementById('scriptHandler') !== undefined){
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) !== null){
        if (localStorage.getItem(scriptName) === 'true'){
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
