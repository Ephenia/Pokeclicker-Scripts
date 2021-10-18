// ==UserScript==
// @name        [Pokeclicker] Additional Visual Settings
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.3
// @author      Ephenia
// @description Adds additional settings for hiding some visual things to help out with performance.
// ==/UserScript==

var checkWildPokeName;
var checkWildPokeDefeat;
var checkWildPokeImg;
var checkWildPokeHealth;
var checkAllNotification;
var awaitVisualSettings;
var trainerCards = document.querySelectorAll('.trainer-card');

for (var i = 0; i < trainerCards.length; i++) {
    trainerCards[i].addEventListener('click', checkVisualSettings, false);
}

function checkVisualSettings() {
    awaitVisualSettings = setInterval(function () {
        var gameState = App.game.gameState;
        if (typeof gameState === 'undefined') {
            console.log("Visual Settings aren't available yet.");
        } else {
            initVisualSettings();
            clearInterval(awaitVisualSettings)
            console.log("Visual settings should be applied.")
        }
    }, 1000);
}

function initVisualSettings() {
    var getMenu = document.getElementById('startMenu');
    var quickSettings = document.createElement("img");
    quickSettings.id = "quick-settings"
    quickSettings.src = "//cdn-icons-png.flaticon.com/512/2099/2099058.png"
    quickSettings.setAttribute("href", "#settingsModal")
    quickSettings.setAttribute("data-toggle", "modal")
    getMenu.prepend(quickSettings)

    document.querySelectorAll('tr[data-bind*="currencyMainDisplayReduced"')[0].outerHTML += `<tr>
    <td class="p-2">
        <label class="m-0">Show wild Pokémon Name</label>
    </td>
    <td class="p-2">
        <input id="poke-name" type="checkbox">
    </td>
</tr>
<tr>
    <td class="p-2">
        <label class="m-0">Show wild Pokémon Defeated</label>
    </td>
    <td class="p-2">
        <input id="poke-defeat" type="checkbox">
    </td>
</tr>
<tr>
    <td class="p-2">
        <label class="m-0">Show wild Pokémon Image</label>
    </td>
    <td class="p-2">
        <input id="poke-image" type="checkbox">
    </td>
</tr>
<tr>
    <td class="p-2">
        <label class="m-0">Show Pokémon Health</label>
    </td>
    <td class="p-2">
        <input id="poke-health" type="checkbox">
    </td>
</tr>`

    var notifiyHTML = document.createElement("tr");
    notifiyHTML.innerHTML = `<td class="p-2">
        <label class="m-0">Disable all Notifications</label>
    </td>
    <td class="p-2">
        <input id="all-notify" type="checkbox">
    </td>`
    document.querySelectorAll('tbody[data-bind*="Object.values(NotificationConstants"')[1].prepend(notifiyHTML)

    checkWildPokeName = localStorage.getItem('checkWildPokeName');
    checkWildPokeDefeat = localStorage.getItem('checkWildPokeDefeat');
    checkWildPokeImg = localStorage.getItem('checkWildPokeImg');
    checkWildPokeHealth = localStorage.getItem('checkWildPokeHealth');
    checkAllNotification = localStorage.getItem('checkAllNotification');
    addGlobalStyle('.pageItemTitle { height:38px }');
    addGlobalStyle('#quick-settings { height:36px;background-color:#eee;border:4px solid #eee;cursor:pointer; }');
    addGlobalStyle('#quick-settings:hover { background-color:#ddd;border: 4px solid #ddd; }');

    if (checkWildPokeName == "OFF") {
        document.querySelector('#poke-name').checked = true
    } else {
        remPokeName();
    }
    if (checkWildPokeDefeat == "OFF") {
        document.querySelector('#poke-defeat').checked = true
    } else {
        remPokeDefeat();
    }
    if (checkWildPokeImg == "OFF") {
        document.querySelector('#poke-image').checked = true
    } else {
        remPokeImg();
    }
    if (checkWildPokeHealth == "OFF") {
        document.querySelector('#poke-health').checked = true
    } else {
        remPokeHealth();
    }
    if (checkAllNotification == "ON") {
        document.querySelector('#all-notify').checked = true
        remNotifications();
    }

    document.querySelector('#map').addEventListener('click', event => {
        if (event.target.matches('[data-bind*="MapHelper.calculateRouteCssClass"')) {
            if (checkWildPokeName == "ON") {
                remPokeName();
            }
            if (checkWildPokeDefeat == "ON") {
                remPokeDefeat();
            }
            if (checkWildPokeImg == "ON") {
                remPokeImg();
            }
            if (checkWildPokeHealth == "ON") {
                remPokeHealth();
            }
        }
    });

    document.querySelector('#poke-name').addEventListener('change', event => {
        if (event.target.checked == true) {
            checkWildPokeName = "OFF";
            localStorage.setItem("checkWildPokeName", "OFF");
        } else {
            checkWildPokeName = "ON";
            localStorage.setItem("checkWildPokeName", "ON");
        }
    });

    document.querySelector('#poke-defeat').addEventListener('change', event => {
        if (event.target.checked == true) {
            checkWildPokeDefeat = "OFF";
            localStorage.setItem("checkWildPokeDefeat", "OFF");
        } else {
            checkWildPokeDefeat = "ON";
            localStorage.setItem("checkWildPokeDefeat", "ON");
        }
    });

    document.querySelector('#poke-image').addEventListener('change', event => {
        if (event.target.checked == true) {
            checkWildPokeImg = "OFF";
            localStorage.setItem("checkWildPokeImg", "OFF");
        } else {
            checkWildPokeImg = "ON";
            localStorage.setItem("checkWildPokeImg", "ON");
        }
    });

    document.querySelector('#poke-health').addEventListener('change', event => {
        if (event.target.checked == true) {
            checkWildPokeHealth = "OFF";
            localStorage.setItem("checkWildPokeHealth", "OFF");
        } else {
            checkWildPokeHealth = "ON";
            localStorage.setItem("checkWildPokeHealth", "ON");
        }
    });

    document.querySelector('#all-notify').addEventListener('change', event => {
        if (event.target.checked == false) {
            checkAllNotification = "OFF";
            localStorage.setItem("checkAllNotification", "OFF");
            var getToast = document.getElementById('toaster-disabled');
            getToast.setAttribute("id", "toaster");
        } else {
            checkAllNotification = "ON";
            localStorage.setItem("checkAllNotification", "ON");
            remNotifications();
        }
    });

    function remPokeName() {
        var enemyName = document.querySelectorAll('knockout[data-bind*="text: Battle.enemyPokemon().name"]');
        if (enemyName.length > 0) {
            enemyName[0].remove()
        }
        var caughtStatus = document.querySelectorAll('knockout[data-bind*="caughtStatusTemplate"');
        if (caughtStatus.length > 0) {
            caughtStatus[0].remove()
        }
    }

    function remPokeDefeat() {
        var pokeDefeat = document.querySelectorAll('knockout[data-bind*="App.game.statistics.routeKills"]');
        if (pokeDefeat.length > 0) {
            pokeDefeat[0].remove()
        }
    }

    function remPokeImg() {
        var enemyPoke = document.querySelectorAll('img.enemy');
        if (enemyPoke.length > 0) {
            enemyPoke[0].remove()
        }
    }

    function remPokeHealth() {
        var healthBar = document.querySelectorAll('.progress.hitpoints');
        if (healthBar.length > 0) {
            healthBar[0].remove()
        }
    }

    function remNotifications() {
        var getToast = document.getElementById('toaster');
        getToast.setAttribute("id", "toaster-disabled");
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

if (localStorage.getItem('checkWildPokeName') == null) {
    localStorage.setItem("checkWildPokeName", "OFF");
}
if (localStorage.getItem('checkWildPokeDefeat') == null) {
    localStorage.setItem("checkWildPokeDefeat", "OFF");
}
if (localStorage.getItem('checkWildPokeImg') == null) {
    localStorage.setItem("checkWildPokeImg", "OFF");
}
if (localStorage.getItem('checkWildPokeHealth') == null) {
    localStorage.setItem("checkWildPokeHealth", "OFF");
}
if (localStorage.getItem('checkAllNotification') == null) {
    localStorage.setItem("checkAllNotification", "OFF");
}
