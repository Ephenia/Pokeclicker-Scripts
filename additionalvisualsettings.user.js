// ==UserScript==
// @name          [Pokeclicker] Additional Visual Settings
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   Adds additional settings for hiding some visual things to help out with performance. Also, includes various features that help with ease of accessibility.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       2.4

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/additionalvisualsettings.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/additionalvisualsettings.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'additionalvisualsettings';

var checkWildPokeName;
var checkWildPokeDefeat;
var checkWildPokeImg;
var checkWildPokeHealth;
var checkWildPokeCatch;
var checkAllNotification;
const notificFunc = Notifier.notify;
var newSave;
var trainerCards;

function initVisualSettings() {
    const getMenu = document.getElementById('startMenu');
    const quickSettings = document.createElement("img");
    quickSettings.id = "quick-settings"
    quickSettings.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAQAAABLCVATAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAHdElNRQfmAQcLFCMs4grwAAACzUlEQVRIx63WvWtbVxgG8J+Vkjgp9hKDwbTBcQoOBIINQUsnDe1gGy8h1VDswUMG4+4hYNwhpv4LumQ2d+gWSqnUwdZQUKFZDIUa4RqiYNyPLMEoUezodNDV7ZUsq1Xq507nvM957/t5zksvTCuqC4K6omnviFElQc0LL9QEJaPvpigvqJhz221zKoL82eT3Omz41Id2/eAlruNn34Idn/vIdTDsE5OeK/i9u9JbtgXBiUjOI3uCTQNgwKZgz7qcyIkg2Haru5qyoCJyKDgSNOxbSuRL9jViyaFIRfDTaVWjtgU7sphXVVewaFwmYWSMW1BQVzWPrB3BdmcCFgQV2XiVNWOoq/tDZlKsimChnfBQEPWd10jwsGVwE7veypnvQs644krKxX8wL+etX9s3h0WCamJ2ExNWREpKIl+40SbLqgoiw536c47UzSTrQcsqQuqrWDaYyGfVHcmdNnRdUEhCPGjDsaBs1T33rCoLjm0kqoYUBOvtqc97YE8jlYFlx2rWjCQ7V62pObac7Cxq2PNAvlkC00qx6fvGY8oNFcFaR4gz1gQVE/F63H58smSaYlzPm5aSgyuCsqun3B9RFqwkipdsxjVepK5mjrinmoRIsNq1clYFUcrSAcypqWdc9MozhFS+xuisjxi7GEvlLuCZVy5mnBMy3rjsWptrrx3gZlf+JA68bnPtmsve9Ar2yCk1PYM91SX9E32nf4p0QS4mh5oF+WXKqpF/K8gWerXIZ6kWuRQzmi3y6HQYO5v2Un9N23pFht33vuf+Soh1X/vejI+N4cCPvvNb6sd/+sMH7nvqZdqeu04c9n2xHTpxt0Vr1ccFW550oTfU1DS6SJ7YcsFku6Iq7qSu9dkzL//ZFOtOfDKFc3uOzu2BbKr6H092eoj4RT41RGw58pVMfL0EGTy2gae+cVNV8awhohN9jTW9cG6DFlP/ffT7G1t3ayJm6d3nAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTAxLTA3VDExOjIwOjI2KzAwOjAwMddkKgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0wMS0wN1QxMToyMDoyNiswMDowMECK3JYAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC"
    quickSettings.setAttribute("href", "#settingsModal")
    quickSettings.setAttribute("data-toggle", "modal")
    getMenu.prepend(quickSettings)
    const quickPokedex = document.createElement("img");
    quickPokedex.id = "quick-pokedex"
    quickPokedex.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABHNCSVQICAgIfAhkiAAAB1xJREFUWIW1mF1sFNcVx3/nzOzaa2PMZ2JFQFFlPszi3RXbgoia1khtJdKgqFIfUqSqVOKlhUgRjVRQpT70oSGKwks+pKa0SlFb2jQqUhOR5iGghjaAUrPrgYUYrIhSkprvDxts787e04eZJQvFaxvCX1rtaObMvb8595xz54wAwhSUy+U6nXNrReRRYBkwH2iLx7kOnAUrmXFQRN7p6+s7NZXxZTJA+XzeD8PwKTPbLCJfFhHBwADB8C2yCwVMAAMRwcwM+NDMXkkkErt7e3vD+wbK5XJrzWyHiCwxM6Y7Y/VohdxYSGe5TEdVSBERjSCc94RTCY9Cc4JDzQmuq8RXOSkiW4rF4t57Asrn86lyufySqv4ARBaGVb47NMrXRso0OasbQWJP3SGDssLfUz5/mNbCvxNac+rrZvZ0EAQ3Jw3U1dXV0dTU9BaQb3aOjddGefLGKN7Uwu2WqsBfW5P8qj3FqCpmdkRV1xUKhf9OCBTD7DezJQtCx88vDbGwYpHb740nkhlnEh4/m93KmYQPcHJsbKznxIkTg+MC5fP5VKVSeV9E8kvLVbZfGqK9CnGU3gdNDQque8K22dM40eRjZkfM7Kv1y6f19mEYvqSq+QVhle2XhiOYWuZ8HhKY7oztF4dZUAkBVojIy/UmHrGHuru716rqC83OyY6LQzwcOiT2ikxirabC3GTGirGQd1uShCLZjo6O3nPnzp2C2EP5fN5X1R1myMZroyyoRFlkDQa9U24KtqMq7E8lcLXnhR35fN4H8AHCMHwKWPKFMOTJG6NxvEzwzAbnfeFIU4JP/cj+kdCxYqzCQ6G7a8wZxv5Ukl+2p7igHqZRRJjZomq1uh7Y5ce2mwHWD43i1RWVuOjeMapxwVNenZHiQCqJiyryreVVM74yUuZHV0d4qBqDGfQnlVfaWzjWlMDEEOOmwAvAJ8BrZrYJ2CW5XG6RmfVPdyZ/HrxO0llD53yU8Ng2p4WrqoAYEJhZEUBEckAGQdqrxnMXh3i4avy6vZl3U00RvJhh/Em1vLVQOHGms7Mz2dLS8omIzAKW+s65taoqq0fLJN3dXV3TBRW2zWnlmqdgHFd1GwuFo4fqbTKZzCpBdl73NP2TuW044KbeSuZejGf6+vr+WTsxMDBQzmazbwEbRORxFZFHMciNVUAa5JPBqzNSXPUUM46HYfjYnTAAQRAcds49ZmalYVVuRpV50Dm3sVgsrqqHqdM+ADNbrcAyE+gsh0Rhd3ed94X3U0kEMVXdWCqVrozHfvTo0atmtjF6DDMz+0YQBL9hnGR0zhXjw7QC88WMjio0Cp7epgQueoqgUCj8n2fuVBAEh6PYEhGRlY1sy+Xy6QieeQpM9w2aJ6g6g34UB7UAnqSK8T1fbGTU399/Q0RCoE0bGdbLaJx996voXQ5URK6HYoxGs46rR8Jo+ePUnuwkufiejxvZLVmypJWoSA8pcNYQznl629Z/mzPMWFqu1s5lMpnMqolgMpnMShHJmZlT1fca2SaTyYUSVdazamYlM2Mg4WPymZNq/w74W2uSZ+e2EntVVHVnd3f3jPEmyOVy7aq6M55kT6FQONMISFVz8ZIdVzM7qKoUmv3brcw4lvTYNHcaz89s5bLnAQwBl4G0qh64m6cymcxKMztgZsudc5fCMNzSCCbWGhFBRD6QbDa7GPio3Uze+PQaCYyLnvJae4p9qSSGYJgDdqnqT6vV6nwReVtE5hAVmSJxNgG5+Cdmdgl4IgiCw41IOjs7k62trWeB2WbWJYBks9lDhq189uoIl1X4Y1szIwIgmNlBEXmmr6/vw9og6XR6fiKReNHMvi0i3u2ONQfsCcNwS6lU+s9ErsnlcuvN7Hdm9q8gCFYKIJlM5nsi8ttbu3t0cFZEthaLxd2Mk3/pdHq+7/tfr9UZEflYVd+bKGZq6unp8a5cuVIQkeXAhmKxuEsAiRvBY8BiYAR4MQzD50ul0o3JDHyv6u7u3qSqLwEDYRimS6VSRQF6e3tDEdkCmIhUnXO/f9Aw2Wx2kar+gigOt5RKpQrUveTHHeXrwDTPk78sXbp01oOCSafTM51ze0Skzcx2BUHwdu3abVuHmT1tZkdAu5qbm/em0+mZDwImkUjsVdVlZlaoVqub66/fBhQEwU1VXWdmJ51zKz3P+0cmk1n8ecFks9lFvu8fAFYBp1T1iTtD41YbVNPg4ODwrFmz3vR9f42qZoANHR0dQ11dXb2nT5+eSiNySz09PV5bW9sPReQNEZlnZgVV/eakWumaMplMi4i8LCLfNzMBSiLy3PDw8JsDAwPlyYB0dnYmU6nUd1R1K7CcKIB3VavVzeMlzYT9Tjab/RawQ0QWOecALqnqW2a2zzlXLJfLp/v7+29AtGsnk8mFqpoD1pjZOhGZE38rOmVmP64P4HsCgqiRjPumTcCXavfEG6IBtQ9RvshnXYJF6lXVlyuVyu5aat83UL2y2ewiEXkcWA2kgXlm1gYgIkNmdhY4LiIfOOfeCYLg5FTG/x/gR3g4jp2VywAAAABJRU5ErkJggg=="
    quickPokedex.setAttribute("href", "#pokedexModal")
    quickPokedex.setAttribute("data-toggle", "modal")
    getMenu.prepend(quickPokedex)

    var scriptSettings = document.getElementById('settings-scripts');
    // Create scripts settings tab if it doesn't exist yet
    if (!scriptSettings) {
        // Fixes the Scripts nav item getting wrapped to the bottom by increasing the max width of the window
        document.getElementById('settingsModal').querySelector('div').style.maxWidth = '850px';
        // Create and attach script settings tab link
        const settingTabs = document.querySelector('#settingsModal ul.nav-tabs');
        let li = document.createElement('li');
        li.classList.add('nav-item');
        li.innerHTML = `<a class="nav-link" href="#settings-scripts" data-toggle="tab">Scripts</a>`;
        settingTabs.appendChild(li);
        // Create and attach script settings tab contents
        const tabContent = document.querySelector('#settingsModal .tab-content');
        let scriptSettings = document.createElement('div');
        scriptSettings.classList.add('tab-pane');
        scriptSettings.setAttribute('id', 'settings-scripts');
        tabContent.appendChild(scriptSettings);
    }
    // Add AVS settings
    let table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-hover', 'm-0');
    scriptSettings.prepend(table);
    let header = document.createElement('thead');
    header.innerHTML = '<tr><th colspan="2">Additional Visual Settings</th></tr>';
    table.appendChild(header);
    let settingsBody = document.createElement('tbody');
    settingsBody.setAttribute('id', 'settings-scripts-additionalvisualsettings');
    table.appendChild(settingsBody);
    let settingsToAdd = [['poke-name', 'Show wild Pokémon Name'],
        ['poke-defeat', 'Show wild Pokémon Defeated'],
        ['poke-image', 'Show wild Pokémon Image'],
        ['poke-health', 'Show Pokémon Health'],
        ['poke-catch', 'Show Catch Icon'],
        ['all-notify', 'Disable all Notifications']];
    settingsToAdd.forEach(([id, desc]) => {
        let elem = document.createElement('tr');
        elem.innerHTML = `<td class="p-2"><label class="m-0 col-md-8" for="checkbox-${id}">${desc}</label></td>` + 
        `<td class="p-2 col-md-4"><input id="checkbox-${id}" type="checkbox"></td>`;
        settingsBody.appendChild(elem);
    });

    //Add 'Disable all notifications' option
    document.getElementById('checkbox-all-notify').addEventListener('change', event => {
        if (event.target.checked == false) {
            checkAllNotification = "OFF";
            localStorage.setItem("checkAllNotification", "OFF");
            Notifier.notify = notificFunc;
        } else {
            checkAllNotification = "ON";
            localStorage.setItem("checkAllNotification", "ON");
            remNotifications();
        }
    });

    checkWildPokeName = localStorage.getItem('checkWildPokeName');
    checkWildPokeDefeat = localStorage.getItem('checkWildPokeDefeat');
    checkWildPokeImg = localStorage.getItem('checkWildPokeImg');
    checkWildPokeHealth = localStorage.getItem('checkWildPokeHealth');
    checkWildPokeCatch = localStorage.getItem('checkWildPokeCatch');
    checkAllNotification = localStorage.getItem('checkAllNotification');
    addGlobalStyle('.pageItemTitle { height:38px }');
    addGlobalStyle('#quick-settings { height:36px;background-color:#eee;border:4px solid #eee;cursor:pointer; }');
    addGlobalStyle('#quick-settings:hover { background-color:#ddd;border: 4px solid #ddd; }');
    addGlobalStyle('#quick-pokedex { height:36px;background-color:#eee;border:4px solid #eee;cursor:pointer; }');
    addGlobalStyle('#quick-pokedex:hover { background-color:#ddd;border: 4px solid #ddd; }');
    addGlobalStyle('#shortcutsContainer { display: block !important; }');
    addGlobalStyle('.gyms-leaders { display: flex;pointer-events: none;position: absolute;height: 36px;top: 0;left: 0;image-rendering: pixelated; }');
    addGlobalStyle('.gyms-badges { position: absolute;height: 36px;display: flex;top: 0;right: 0; }');
    addGlobalStyle('.dungeons-costs { position: relative;margin-right: 12px;filter: none !important }');
    addGlobalStyle('#Dungeons-buttons > button:hover { -webkit-animation: bounceBackground 60s linear infinite alternate;animation: bounceBackground 60s linear infinite alternate; }');
    addGlobalStyle('#Dungeons-buttons > button * { z-index: 2 }');
    addGlobalStyle('.dungeons-overlay { width: 100%;height: 100%;position: absolute;background-color: rgba(0,0,0,0.45);margin-top: -6px;margin-left: -8px;z-index: 1 !important }');
    addGlobalStyle('.dungeons-info { position: relative;font-weight: bold }');

    //The elements removed by the scripts don't ever get added back after a restart, waiting a second before removing makes them load properly
    if (checkWildPokeName == "OFF") {
        document.getElementById('checkbox-poke-name').checked = true
    } else {
        remPokeName();
    }
    if (checkWildPokeDefeat == "OFF") {
        document.getElementById('checkbox-poke-defeat').checked = true
    } else {
        remPokeDefeat();
    }
    if (checkWildPokeImg == "OFF") {
        document.getElementById('checkbox-poke-image').checked = true
    } else {
        remPokeImg();
    }
    if (checkWildPokeHealth == "OFF") {
        document.getElementById('checkbox-poke-health').checked = true
    } else {
        remPokeHealth();
    }
    if (checkWildPokeCatch == "OFF") {
        document.getElementById('checkbox-poke-catch').checked = true
    } else {
        remPokeCatch();
    }
    if (checkAllNotification == "ON") {
        document.getElementById('checkbox-all-notify').checked = true
        remNotifications();
    }

    document.getElementById('map').addEventListener('click', event => {
        if (event.target.matches('[data-route]')) {
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
            if (checkWildPokeCatch == "ON") {
                remPokeCatch();
            }
        }
    });

    document.getElementById('checkbox-poke-name').addEventListener('change', event => {
        if (event.target.checked == true) {
            checkWildPokeName = "OFF";
            localStorage.setItem("checkWildPokeName", "OFF");
        } else {
            checkWildPokeName = "ON";
            localStorage.setItem("checkWildPokeName", "ON");
        }
    });

    document.getElementById('checkbox-poke-defeat').addEventListener('change', event => {
        if (event.target.checked == true) {
            checkWildPokeDefeat = "OFF";
            localStorage.setItem("checkWildPokeDefeat", "OFF");
        } else {
            checkWildPokeDefeat = "ON";
            localStorage.setItem("checkWildPokeDefeat", "ON");
        }
    });

    document.getElementById('checkbox-poke-image').addEventListener('change', event => {
        if (event.target.checked == true) {
            checkWildPokeImg = "OFF";
            localStorage.setItem("checkWildPokeImg", "OFF");
        } else {
            checkWildPokeImg = "ON";
            localStorage.setItem("checkWildPokeImg", "ON");
        }
    });

    document.getElementById('checkbox-poke-health').addEventListener('change', event => {
        if (event.target.checked == true) {
            checkWildPokeHealth = "OFF";
            localStorage.setItem("checkWildPokeHealth", "OFF");
        } else {
            checkWildPokeHealth = "ON";
            localStorage.setItem("checkWildPokeHealth", "ON");
        }
    });

    document.getElementById('checkbox-poke-catch').addEventListener('change', event => {
        if (event.target.checked == true) {
            checkWildPokeCatch = "OFF";
            localStorage.setItem("checkWildPokeCatch", "OFF");
        } else {
            checkWildPokeCatch = "ON";
            localStorage.setItem("checkWildPokeCatch", "ON");
        }
    });

    function remPokeName() {
        if (player.route()) {
            const enemyName = document.querySelectorAll('.pageItemTitle knockout');
            if (enemyName.length > 0) {
                enemyName[0].remove();
            }
        }
    }

    function remPokeDefeat() {
        const pokeDefeat = document.querySelectorAll('knockout[data-bind*="App.game.statistics.routeKills"]');
        if (pokeDefeat.length > 0) {
            pokeDefeat[0].remove()
        }
    }

    function remPokeImg() {
        const enemyPoke = document.querySelectorAll('knockout[data-bind*="pokemonSpriteTemplate"]');
        if (enemyPoke.length > 0) {
            enemyPoke[0].remove()
        }
    }

    function remPokeHealth() {
        const healthBar = document.querySelectorAll('.progress.hitpoints');
        if (healthBar.length > 0) {
            healthBar[0].remove()
        }
    }

    function remPokeCatch() {
        const catchIcon = document.querySelectorAll('.catchChance');
        if (catchIcon.length > 0) {
            catchIcon[0].remove()
        }
    }

    function remNotifications() {
        Notifier.notify = function(message) {
            const sound = message.sound;
            if (typeof sound != 'undefined') {
                sound.play();
            }
        }
    }

    //Add dock button
    const dockButton = document.createElement('button')
    dockButton.style = 'position: absolute; left: 32px; top: 0px; width: auto; height: 41px; font-size: 11px;'
    dockButton.className = 'btn btn-block btn-success'
    dockButton.id = 'dock-button'
    dockButton.textContent = 'Dock'
    document.getElementById('townMap').appendChild(dockButton)
    document.getElementById('dock-button').addEventListener('click', MapHelper.openShipModal, false)

    //Add Gyms button
    const gymsButton = document.createElement('button');
    gymsButton.style = 'position: absolute;left: 75px;top: -8px;width: auto;height: 41px;font-size: 11px;';
    gymsButton.className = 'btn btn-block btn-success';
    gymsButton.id = 'gyms-button';
    gymsButton.textContent = 'Gyms';
    document.getElementById('townMap').appendChild(gymsButton);
    document.getElementById('gyms-button').addEventListener('click', () => { generateGymsList();$('#GymsModal').modal('show'); }, false);

    //Add Dungeons button
    const dungeonsButton = document.createElement('button');
    dungeonsButton.style = 'position: absolute;left: 121px;top: -8px;width: auto;height: 41px;font-size: 11px;';
    dungeonsButton.className = 'btn btn-block btn-success';
    dungeonsButton.id = 'dungeons-button';
    dungeonsButton.textContent = 'Dungeons';
    document.getElementById('townMap').appendChild(dungeonsButton);
    document.getElementById('dungeons-button').addEventListener('click', () => { generateDungeonssList();$('#DungeonsModal').modal('show'); }, false);

    createGymDungeonModals();

    function createGymDungeonModals() {
        const modNames = ['Gyms', 'Dungeons'];
        const fragment = new DocumentFragment();
        for (let i = 0; i < modNames.length; i++) {
            const customMods = document.createElement('div');
            customMods.setAttribute('class', 'modal noselect fade');
            customMods.setAttribute('tabindex', '-1');
            customMods.setAttribute('role', 'dialogue');
            customMods.setAttribute('id', `${modNames[i]}Modal`);
            customMods.setAttribute('aria-labelledby', `${modNames[i]}ModalLabel`);
            customMods.innerHTML = `<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header" style="justify-content: space-around;">
                        <h5 id="${modNames[i]}-title" class="modal-title"></h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div class="modal-body bg-ocean">
                    <div id="${modNames[i]}-buttons"></div>
                    </div>
                </div>
            </div>`
            fragment.appendChild(customMods);
        }
        document.getElementById('ShipModal').after(fragment);
    }

    function generateGymsList() {
        const gymBtns = document.getElementById('Gyms-buttons');
        const gymsHead = document.getElementById('Gyms-title');
        gymsHead.textContent = `Gym Select (${GameConstants.camelCaseToString(GameConstants.Region[player.region])})`;
        gymBtns.innerHTML = '';
        const fragment = new DocumentFragment();
        for (const gym of Object.values(GymList)) {
            let region = gym.parent?.region;
            if (player.region == region) {
                const btn = document.createElement('button');
                btn.setAttribute('style', 'position: relative;');
                btn.setAttribute('class', 'btn btn-block btn-success');
                btn.addEventListener('click', () => {
                    if (!MapHelper.isTownCurrentLocation(gym.parent.name)) {
                        MapHelper.moveToTown(gym.parent.name);
                    }
                    $("#GymsModal").modal("hide");
                    GymRunner.startGym(gym, false); 
                });
                btn.disabled = !(gym.isUnlocked() && MapHelper.calculateTownCssClass(gym.parent.name));
                btn.innerHTML = `<div class="gyms-leaders">
                    <img src="assets/images/gymLeaders/${gym.leaderName}.png" onerror="this.onerror=null;this.style.display='none';">
                    </div>
                    <div class="gyms-badges">
                    <img src="assets/images/badges/${BadgeEnums[gym.badgeReward]}.png" onerror="this.onerror=null;this.style.display='none';">
                    </div>
                    ${gym.leaderName}`;
                fragment.appendChild(btn);
            }
        }
        gymBtns.appendChild(fragment);
    }

    function generateDungeonssList() {
        const dungeonsBtns = document.getElementById('Dungeons-buttons');
        const dungeonsHead = document.getElementById('Dungeons-title');
        dungeonsHead.textContent = `Dungeon Select (${GameConstants.camelCaseToString(GameConstants.Region[player.region])})`;
        dungeonsBtns.innerHTML = '';
        const fragment = new DocumentFragment();
        for (const town in TownList) {
            const townData = TownList[town];
            if (townData.constructor.name == 'DungeonTown' && townData.dungeon != null) {
                const townName = townData.name;
                const dungeonRegion = townData.region;
                const dungeonData = townData.dungeon;
                const dungeonClears = App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dungeonData.name)]();
                const dungeonTokens = App.game.wallet.currencies[GameConstants.Currency.dungeonToken]();
                const affordEntry = dungeonData.tokenCost <= dungeonTokens ? true : false;
                const canAccess = townData.isUnlocked() && affordEntry;
                if (dungeonRegion == player.region) {
                    const btn = document.createElement('button');
                    btn.setAttribute('style', `position: relative;background-image: url("assets/images/towns/${dungeonData.name}.png");background-position: center;opacity: ${canAccess ? 1 : 0.70};filter: brightness(${canAccess ? 1 : 0.70});`);
                    btn.setAttribute('class', 'btn btn-block btn-success');
                    btn.addEventListener('click', () => {
                        if (!MapHelper.isTownCurrentLocation(townName)) {
                            MapHelper.moveToTown(townName);
                        }
                        $("#DungeonsModal").modal("hide");
                        DungeonRunner.initializeDungeon(dungeonData);
                    });
                    canAccess ? btn.disabled = false : btn.disabled = true;
                    btn.innerHTML = `<div class="dungeons-overlay"></div>
                    <div class="dungeons-costs">
                    <img src="assets/images/currency/dungeonToken.svg" style="height: 24px; width: 24px;">
                    <span style="font-weight: bold;color: ${affordEntry ? 'greenyellow' : '#f04124'}">${dungeonData.tokenCost.toLocaleString('en-US')}</span>
                    </div>
                    <div class="dungeons-info">
                    <span>${dungeonData.name}</span>
                    <div>${dungeonClears.toLocaleString('en-US')} clears</div>
                    </div>`;
                    fragment.appendChild(btn);
                }
            }
        }
        dungeonsBtns.appendChild(fragment);
    }
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
if (localStorage.getItem('checkWildPokeCatch') == null) {
    localStorage.setItem("checkWildPokeCatch", "OFF");
}
if (localStorage.getItem('checkAllNotification') == null) {
    localStorage.setItem("checkAllNotification", "OFF");
}

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initVisualSettings()
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
