// ==UserScript==
// @name          [Pokeclicker] Catch Filter Fantasia
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Credit: Pastaficionado, umamaistempo)
// @description   An experimental catch filter that aims to help you have much better control and will completely change how you capture Pokémon.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.9

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/catchfilterfantasia.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/catchfilterfantasia.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'catchfilterfantasia';

const ballNames = ['None', 'Pokeball', 'Greatball', 'Ultraball', 'Masterball', 'Fastball', 'Quickball', 'Timerball', 'Duskball', 'Luxuryball', 'Diveball', 'Lureball', 'Nestball', 'Repeatball', 'Beastball'];
var filterState;
var filterTypes;
var filterBallPref;
var catchFilter;
var filterColor;

function initCatchFilter() {
    const pokeballDisplay = document.getElementById('pokeballSelector');
    const profileModal = document.getElementById('profileModal');
    filterState ? filterColor = true : filterColor = false;

    // Setting custon CSS styles
    addGlobalStyle('#catch-filter-btn { position: absolute; left: 0px; top: 0px; width: auto; height: 41px; }');
    addGlobalStyle('#catch-filter-cont { display: flex; flex-direction: column; justify-content: center; }');
    addGlobalStyle('#filter-results { cursor: pointer; }');
    addGlobalStyle('#filter-results > div { display: flex; align-items: center; justify-content: center; min-height: 34px; }');
    addGlobalStyle('#filter-results > div:hover { background-color: gold; }');
    addGlobalStyle('.filter-pokeball-n { position: absolute; right: 25%; }');
    addGlobalStyle('.filter-pokeball-s { position: absolute; right: 20%; }');
    addGlobalStyle('.filter-shiny { position: absolute; right: 17%; }');
    addGlobalStyle('#filter-btn-cont { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; }');
    addGlobalStyle('#filter-btn-cont > button { display: flex; justify-content: center; min-width: 107px; }');
    addGlobalStyle('#filter-btn-tools { display: flex; flex-direction: row; justify-content: space-between; align-items: flex-end; column-gap: 10px; }');

    // Creating the button to append to the Pokeballs container
    let frag = new DocumentFragment();
    const btn = document.createElement('button');
    btn.innerText = 'Filter'
    btn.setAttribute('id', 'catch-filter-btn')
    btn.setAttribute('class', 'btn btn-sm btn-primary');
    btn.addEventListener('click', () => { $('#filterModal').modal('show') })
    frag.appendChild(btn);
    pokeballDisplay.appendChild(frag);

    // Creating a modal for the catch filter
    const filterMod = document.createElement('div');
    filterMod.setAttribute("class", "modal noselect fade show");
    filterMod.setAttribute("id", "filterModal");
    filterMod.setAttribute("tabindex", "-1");
    filterMod.setAttribute("aria-labelledby", "filterModal");
    filterMod.setAttribute("aria-labelledby", "filterModal");
    filterMod.setAttribute("aria-modal", "true");
    filterMod.setAttribute("role", "dialog");
    filterMod.innerHTML = `<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header" style="justify-content: space-around;">
            <h5 class="modal-title">Catch Filter</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
            </button>
        </div>
        <div class="modal-body">
        </div>
    </div>`
    profileModal.before(filterMod);

    const modalBody = document.querySelector('[id=filterModal] div div [class=modal-body]');
    modalBody.innerHTML = `<button id="catch-filter" class="btn btn-${filterColor ? 'success' : 'danger'}" style="margin-left:20px;">Catch Filter ${filterState ? '[ON]' : '[OFF]'}</button>
    <hr>
    <div id="filter-btn-cont"></div>
    <hr>
    <div id="filter-btn-tools">
    <button id="filter-load" class="btn btn-block btn-primary">Load Filtered</button>
    <button id="filter-route" class="btn btn-block btn-primary">Load Route</button>
    <button id="filter-dungeon" class="btn btn-block btn-primary">Load Dungeon</button>
    <button id="filter-all" class="btn btn-block btn-primary">Filter All</button>
    <button id="unfilter-all" class="btn btn-block btn-primary">Unfilter All</button>
    <button id="reset-ball-filter" class="btn btn-block btn-primary">Reset Balls</button>
    </div>
    <hr>
    <div id="catch-filter-cont">
    <input id="filter-search" type="text" placeholder="Search for a Pokémon...">
    <hr>
    <div id="filter-results"></div>
    </div>`
    // Re-assigning the previous document fragment
    frag = new DocumentFragment();
    filterTypes.forEach((Type, Index) => {
        const typeName = PokemonType[Index];
        const btn = document.createElement('button');
        btn.innerText = `${typeName} ${Type ? '[ON]' : '[OFF]'}`;
        btn.setAttribute('class', `btn btn-${Type ? 'success' : 'danger'}`);
        btn.setAttribute('data-src', Index);
        btn.addEventListener('click', (event) => { toggleTypeFilter(event); });
        frag.appendChild(btn);
    })
    document.getElementById('filter-btn-cont').appendChild(frag);
    document.getElementById('filter-load').addEventListener('click', () => { loadFilteredList(); });
    document.getElementById('filter-route').addEventListener('click', (event) => { filterPokemonRoute(event); });
    document.getElementById('filter-dungeon').addEventListener('click', (event) => { filterPokemonDungeon(event); });
    document.getElementById('filter-all').addEventListener('click', () => { filterAllPoke(); });
    document.getElementById('unfilter-all').addEventListener('click', () => { unfilterAllPoke(); });
    document.getElementById('reset-ball-filter').addEventListener('click', () => { resetBallFilterAll(); });
    document.getElementById('catch-filter').addEventListener('click', (event) => { toggleCatchFilter(event); });
    document.getElementById('filter-search').addEventListener('input', (event) => { filterPokeSearch(event); });

    overloadPokeballMethod();
    loadFilteredList();
}

function toggleTypeFilter(event) {
    const elem = event.target;
    const index = +elem.getAttribute('data-src');
    const typeName = PokemonType[index];
    filterTypes[index] ? filterTypes[index] = false : filterTypes[index] = true;
    elem.setAttribute('class', `btn btn-${filterTypes[index] ? 'success' : 'danger'}`);
    elem.innerText = `${typeName} ${filterTypes[index] ? '[ON]' : '[OFF]'}`;
    localStorage.setItem('filterTypes', JSON.stringify(filterTypes));
}

function loadFilteredList() {
    if (catchFilter.length != 0) {
        document.getElementById('filter-results').innerHTML = '';
        const frag = new DocumentFragment();
        for (const id of catchFilter) {
            const findPoke = pokemonList.find(p => p.id == id);
            const pokeIndex = pokemonList.indexOf(findPoke);
            const ballPrefN = filterBallPref[pokeIndex].normal;
            const ballPrefS = filterBallPref[pokeIndex].shiny;
            const div = document.createElement('div');
            div.innerHTML = `${findPoke.name}
            <img src="assets/images/pokeball/${ballNames[ballPrefN]}.svg" class="filter-pokeball-n pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="normal">
            <img src="assets/images/pokeball/${ballNames[ballPrefS]}.svg" class="filter-pokeball-s pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="shiny">
            <div class="filter-shiny">✨</div>`;
            div.setAttribute('data-src', findPoke.id);
            if (catchFilter.includes(findPoke.id)) {
                div.setAttribute('style', 'background-color: yellowgreen;');
            }
            div.addEventListener('click', (event) => { toggleFilteredPoke(event);loadFilteredList(); });
            frag.appendChild(div);
        }
        document.getElementById('filter-results').appendChild(frag);
        setRightClick();
    } else {
        document.getElementById('filter-results').innerHTML = '<b style="color: red">Your filtered list is empty.</b>';
    }
}

function filterPokemonRoute(event) {
    const elem = event.target;
    document.getElementById('filter-results').innerHTML = '';
    let routePoke;
    try {routePoke = Routes.getRoute(player.region, player.route()).pokemon
         const frag = new DocumentFragment();
         //Using a side array to ensure adding pokemons only once in results (multiple occurences can occur with special)
         let routePokesList = [];
         for (const area in routePoke) {
            const routeArea = routePoke[area];
            if (routeArea.length > 0) {
                //Special Route Pokemons (Weather, Quests, ...)
                if (area ==="special") {
                    for (const speRoute of routeArea) {
                        const speRoutePokes = speRoute.pokemon;
                        for (const poke of speRoutePokes) {
                            const findPoke = pokemonList.find(p => p.name == poke);
                            if (!routePokesList.includes(findPoke.id)) {
                                routePokesList.push(findPoke.id);
                                const pokeIndex = pokemonList.indexOf(findPoke);
                                const ballPrefN = filterBallPref[pokeIndex].normal;
                                const ballPrefS = filterBallPref[pokeIndex].shiny;
                                const div = document.createElement('div');
                                div.innerHTML = `${findPoke.name}
                                <img src="assets/images/pokeball/${ballNames[ballPrefN]}.svg" class="filter-pokeball-n pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="normal">
                                <img src="assets/images/pokeball/${ballNames[ballPrefS]}.svg" class="filter-pokeball-s pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="shiny">
                                <div class="filter-shiny">✨</div>`;
                                div.setAttribute('data-src', findPoke.id);
                                if (catchFilter.includes(findPoke.id)) {
                                    div.setAttribute('style', 'background-color: yellowgreen;');
                                }
                                div.addEventListener('click', (event) => { toggleFilteredPoke(event); });
                                frag.appendChild(div);
                            }
                        }
                    }
                }
                else {
                    const thisArea = routePoke[area];
                    for (const poke of routeArea) {
                        const findPoke = pokemonList.find(p => p.name == poke);
                        if (!routePokesList.includes(findPoke.id)) {
                            routePokesList.push(findPoke.id);
                            const pokeIndex = pokemonList.indexOf(findPoke);
                            const ballPrefN = filterBallPref[pokeIndex].normal;
                            const ballPrefS = filterBallPref[pokeIndex].shiny;
                            const div = document.createElement('div');
                            div.innerHTML = `${findPoke.name}
                            <img src="assets/images/pokeball/${ballNames[ballPrefN]}.svg" class="filter-pokeball-n pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="normal">
                            <img src="assets/images/pokeball/${ballNames[ballPrefS]}.svg" class="filter-pokeball-s pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="shiny">
                            <div class="filter-shiny">✨</div>`;
                            div.setAttribute('data-src', findPoke.id);
                            if (catchFilter.includes(findPoke.id)) {
                                div.setAttribute('style', 'background-color: yellowgreen;');
                            }
                            div.addEventListener('click', (event) => { toggleFilteredPoke(event); });
                            frag.appendChild(div);
                        }
                    }
                }
            }
         }
         if (routePokesList.length > 0) {
            document.getElementById('filter-results').appendChild(frag);
            setRightClick();
        }
    } catch (err) {
        document.getElementById('filter-results').innerHTML = '<b style="color: red">You are not on a route.</b>';
    };
}

function filterPokemonDungeon(event) {
    const elem = event.target;
    document.getElementById('filter-results').innerHTML = '';
    let validDungeon;
    try {validDungeon = DungeonRunner.dungeon;
         const dungeonPoke = validDungeon.enemyList;
         const dungeonBoss = validDungeon.bossList;
         const frag = new DocumentFragment();

         for (const enemy of dungeonPoke) {
             let pokeStr;
             if (typeof enemy == 'string') {
                 pokeStr = enemy;
             } else if (typeof enemy.pokemon == 'string') {
                 pokeStr = enemy.pokemon;
             }
             if (typeof pokeStr != 'undefined') {
                 const findPoke = pokemonList.find(p => p.name == pokeStr);
                 const pokeIndex = pokemonList.indexOf(findPoke);
                 const ballPrefN = filterBallPref[pokeIndex].normal;
                 const ballPrefS = filterBallPref[pokeIndex].shiny;
                 const div = document.createElement('div');
                 div.innerHTML = `${findPoke.name}
                 <img src="assets/images/pokeball/${ballNames[ballPrefN]}.svg" class="filter-pokeball-n pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="normal">
                 <img src="assets/images/pokeball/${ballNames[ballPrefS]}.svg" class="filter-pokeball-s pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="shiny">
                 <div class="filter-shiny">✨</div>`;
                 div.setAttribute('data-src', findPoke.id);
                 if (catchFilter.includes(findPoke.id)) {
                     div.setAttribute('style', 'background-color: yellowgreen;');
                 }
                 div.addEventListener('click', (event) => { toggleFilteredPoke(event); });
                 frag.appendChild(div);
             }
         }

         for (const enemy of dungeonBoss) {
             let pokeStr;
             const construct = enemy.constructor.name;
             if (construct == 'DungeonBossPokemon') {
                 pokeStr = enemy.name;
             }
             if (typeof pokeStr != 'undefined') {
                 const findPoke = pokemonList.find(p => p.name == pokeStr);
                 const pokeIndex = pokemonList.indexOf(findPoke);
                 const ballPrefN = filterBallPref[pokeIndex].normal;
                 const ballPrefS = filterBallPref[pokeIndex].shiny;
                 const div = document.createElement('div');
                 div.innerHTML = `${findPoke.name}
                 <img src="assets/images/pokeball/${ballNames[ballPrefN]}.svg" class="filter-pokeball-n pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="normal">
                 <img src="assets/images/pokeball/${ballNames[ballPrefS]}.svg" class="filter-pokeball-s pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="shiny">
                 <div class="filter-shiny">✨</div>`;
                 div.setAttribute('data-src', findPoke.id);
                 if (catchFilter.includes(findPoke.id)) {
                     div.setAttribute('style', 'background-color: yellowgreen;');
                 }
                 div.addEventListener('click', (event) => { toggleFilteredPoke(event); });
                 frag.appendChild(div);
             }
         }
         document.getElementById('filter-results').appendChild(frag);
         setRightClick();

        } catch (err) {
            document.getElementById('filter-results').innerHTML = '<b style="color: red">You are not in a dungeon or dungeon info cannot be found.</b>';
        };
}

function filterAllPoke() {
    catchFilter = [];
    for (const poke of pokemonList) {
        catchFilter.push(poke.id);
    }
    localStorage.setItem('catchFilter', JSON.stringify(catchFilter));
    filterPokeSearch(true);
}

function unfilterAllPoke() {
    catchFilter = [];
    localStorage.setItem('catchFilter', JSON.stringify(catchFilter));
    filterPokeSearch(true);
}

function resetBallFilterAll() {
    filterBallPref = new Array(pokemonList.length).fill({normal: 0, shiny: 0}, 0, pokemonList.length);
    localStorage.setItem('filterBallPref', JSON.stringify(filterBallPref));
    filterPokeSearch(true);
}

function toggleCatchFilter(event) {
    const elem = event.target;
    filterState ? filterColor = false : filterColor = true;
    filterState = filterColor;
    elem.setAttribute('class', `btn btn-${filterColor ? 'success' : 'danger'}`);
    elem.innerText = `Catch Filter ${filterState ? "[ON]" : "[OFF]"}`;
    localStorage.setItem('filterState', filterState);
}

function filterPokeSearch(event) {
    document.getElementById('filter-results').innerHTML = '';
    let pokeStr;
    try { pokeStr = event.target.value.toLowerCase(); } catch (err) { pokeStr = document.getElementById('filter-search').value; };
    const filterList = pokemonList.filter(p => p.name.toLowerCase().includes(pokeStr));
    const frag = new DocumentFragment();
    for (const poke of filterList) {
        const findPoke = pokemonList.find(p => p.name == poke.name);
        const pokeIndex = pokemonList.indexOf(findPoke);
        const ballPrefN = filterBallPref[pokeIndex].normal;
        const ballPrefS = filterBallPref[pokeIndex].shiny;
        const div = document.createElement('div');
        div.innerHTML = `${findPoke.name}
        <img src="assets/images/pokeball/${ballNames[ballPrefN]}.svg" class="filter-pokeball-n pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="normal">
        <img src="assets/images/pokeball/${ballNames[ballPrefS]}.svg" class="filter-pokeball-s pokeball-small pokeball-selected" ball-pref="${pokeIndex}" pref-type="shiny">
        <div class="filter-shiny">✨</div>`;
        div.setAttribute('data-src', poke.id);
        if (catchFilter.includes(poke.id)) {
            div.setAttribute('style', 'background-color: yellowgreen;');
        }
        div.addEventListener('click', (event) => { toggleFilteredPoke(event); });
        frag.appendChild(div);
    }
    document.getElementById('filter-results').appendChild(frag);
    setRightClick();
}

function toggleFilteredPoke(event) {
    const elem = event.target;
    const id = +elem.getAttribute('data-src');
    if (elem.hasAttribute('ball-pref')) {
        const ballPref = +elem.getAttribute('ball-pref');
        const prefType = elem.getAttribute('pref-type');
        filterBallPref[ballPref][prefType] < ballNames.length - 1 ? filterBallPref[ballPref][prefType]++ : filterBallPref[ballPref][prefType] = 0;
        elem.src = `assets/images/pokeball/${ballNames[filterBallPref[ballPref][prefType]]}.svg`
        localStorage.setItem('filterBallPref', JSON.stringify(filterBallPref));
        return;
    }
    const idExists = catchFilter.indexOf(id);
    if (idExists == -1) {
        catchFilter.push(id);
        elem.setAttribute('style', 'background-color: yellowgreen;');
    } else {
        catchFilter.splice(idExists, 1);
        elem.removeAttribute('style');
    }
    localStorage.setItem('catchFilter', JSON.stringify(catchFilter));
}

function setRightClick() {
    const ballElemsN = document.getElementsByClassName('filter-pokeball-n');
    const ballElemsS = document.getElementsByClassName('filter-pokeball-s');
    for (let i = 0; i < ballElemsN.length; i++) {
        ballElemsN[i].addEventListener('contextmenu', (event) => { event.preventDefault();resetBallFilter(event); });
    }
    for (let ii = 0; ii < ballElemsS.length; ii++) {
        ballElemsS[ii].addEventListener('contextmenu', (event) => { event.preventDefault();resetBallFilter(event); });
    }
}

function resetBallFilter(event) {
    const elem = event.target;
    const ballPref = +elem.getAttribute('ball-pref');
    const prefType = elem.getAttribute('pref-type');
    filterBallPref[ballPref][prefType] = 0;
    elem.src = `assets/images/pokeball/${ballNames[filterBallPref[ballPref][prefType]]}.svg`
    localStorage.setItem('filterBallPref', JSON.stringify(filterBallPref));
}

function overloadPokeballMethod() {
    const hasBall = function(ballId) {
        return App.game.pokeballs.pokeballs[ballId].quantity() > 0;
    }

    const newMethod = function(id, isShiny, isShadow, encounterType) {
        const pokemon = PokemonHelper.getPokemonById(id);
        const type1 = pokemon.type1;
        const type2 = pokemon.type2;

        // FIXME: we could just use a map with the changes we want
        const pokeIndex = pokemonList.findIndex(p => p.id == pokemon.id);

        // FIXME: the values of pokeballs for the choices on the modal are
        //   offset by -1
        let ballPrefN = filterBallPref[pokeIndex].normal - 1;
        let ballPrefS = filterBallPref[pokeIndex].shiny - 1;
        const overrideBallN = ballPrefN !== GameConstants.Pokeball.None;
        const overrideBallS = ballPrefS !== GameConstants.Pokeball.None;

        const isAllowed = catchFilter.includes(id) || filterTypes[type1] || filterTypes[type2]

        if (filterState && isAllowed && isShiny && overrideBallS && hasBall(ballPrefS)) {
            return ballPrefS;
        } else if (filterState && isAllowed && !isShiny && overrideBallN && hasBall(ballPrefN)) {
            return ballPrefN;
        } else if (filterState && !isAllowed) {
            return GameConstants.Pokeball.None;
        } else {
            return App.game.pokeballs.oldCalculatePokeballToUse(id, isShiny, isShadow, encounterType);
        }
    }

    // HACK: doing this to keep the function inside the pokeballs object
    //   otherwise it will not have correct access to `this`. Doing this this
    //   way to just overload the function instead of rewriting it.
    App.game.pokeballs.oldCalculatePokeballToUse = App.game.pokeballs.calculatePokeballToUse;
    App.game.pokeballs.calculatePokeballToUse = newMethod;
}

if (!localStorage.getItem('filterState')) {
    localStorage.setItem('filterState', false);
}
if (!localStorage.getItem('filterTypes')) {
    const typeArray = new Array(18).fill(false, 0, 18);
    localStorage.setItem('filterTypes', JSON.stringify(typeArray));
}
if (!localStorage.getItem('filterBallPref')) {
    const prefArray = new Array(pokemonList.length).fill({normal: 0, shiny: 0}, 0, pokemonList.length);
    localStorage.setItem('filterBallPref', JSON.stringify(prefArray));
}
if (!localStorage.getItem('catchFilter')) {
    localStorage.setItem('catchFilter', JSON.stringify([]));
}
filterState = JSON.parse(localStorage.getItem('filterState'));
filterTypes = JSON.parse(localStorage.getItem('filterTypes'));
catchFilter = JSON.parse(localStorage.getItem('catchFilter'));
filterBallPref = JSON.parse(localStorage.getItem('filterBallPref'));

if (filterBallPref.length != pokemonList.length) {
    const diff = pokemonList.length - filterBallPref.length;
    const newPoke = new Array(diff).fill({normal: 0, shiny: 0}, 0, diff);
    filterBallPref = filterBallPref.concat(newPoke);
    localStorage.setItem('filterBallPref', JSON.stringify(filterBallPref));
}

const fixIt = filterBallPref.filter(e => typeof e == 'number');
if (fixIt.length != 0) {
    for (const index in filterBallPref) {
        if (typeof filterBallPref[index] == 'number') {
            filterBallPref[index] = {normal: 0, shiny: 0};
        }
    }
    localStorage.setItem('filterBallPref', JSON.stringify(filterBallPref));
}

function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args);
        if (App.game && !hasInitialized) {
            initCatchFilter();
            hasInitialized = true;
        }
        return result
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
