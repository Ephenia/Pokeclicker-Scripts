// ==UserScript==
// @name          [Pokeclicker] Infinite Seasonal Events
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   Adds in toggable options to have seasonal events infinitely run. Events can also run simultaneously with one another. Includes a custom event as well.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.3

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/infiniteseasonalevents.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/infiniteseasonalevents.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'infiniteseasonalevents'

var activeSeasonalEvents = {};

//Removed setTimeout, opted to make it load like the other scrips, also helps with notifications
function initEvents() {
    const NUM_EVENTS = 10;
    const startDate = new Date(new Date().getFullYear(), -1);
    const endDate = new Date(new Date().getFullYear(), 10000);

    App.game.specialEvents.newEvent('Ephenia\'s Gift',
        'Encounter Ribombee that roams across all regions.<br/>A special thanks for using my scripts!',
        startDate,
        () => {
            GameHelper.enumNumbers(GameConstants.Region).filter(i => i != GameConstants.Region.none).forEach(region => {
                RoamingPokemonList.add(region, 0, new RoamingPokemon('Ribombee')); // Currently adding in base subregions only
            });
        },
        endDate,
        () => {
            GameHelper.enumNumbers(GameConstants.Region).filter(i => i != GameConstants.Region.none).forEach(region => {
                RoamingPokemonList.remove(region, 0, 'Ribombee');
            });
        },
        true
    );

    //Testing loading events in init
    for (const event of App.game.specialEvents.events) {
        let eventActive = loadSetting(event.title, false);
        activeSeasonalEvents[event.title] = eventActive;
    }

    for (const event of App.game.specialEvents.events) {
        event.startTime = startDate;
        event.endTime = endDate;

        if (!event.hasStarted() && activeSeasonalEvents[event.title]) {
            event.start();
        }
    }

    if (App.game.specialEvents.events.length != NUM_EVENTS) {
        Notifier.notify({
            title: '[Outdated] Infinite Seasonal Events',
            message: `Please contact <a href="https://github.com/Ephenia/Pokeclicker-Scripts" target="_blank">Ephenia</a> so that this script can be updated!`,
            type: NotificationConstants.NotificationOption.danger,
            timeout: 1000000
        });
    }

    var eventLi = document.createElement('li');
    eventLi.innerHTML = `<a class="dropdown-item" href="#eventModal" data-toggle="modal">Toggle Events</a>`;
    for (const node of document.querySelectorAll('#startMenu ul li')) {
        if (node.querySelector('a[href="#eventsModal"]')) {
            node.after(eventLi);
            break;
        }
    }

    var eventMod = document.createElement('div');
    eventMod.setAttribute("class", "modal noselect fade show");
    eventMod.setAttribute("id", "eventModal");
    eventMod.setAttribute("tabindex", "-1");
    eventMod.setAttribute("aria-labelledby", "eventModal");
    eventMod.setAttribute("aria-labelledby", "eventModal");
    eventMod.setAttribute("aria-modal", "true");
    eventMod.setAttribute("role", "dialog");

    eventMod.innerHTML = `<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header" style="justify-content: space-around;">
            <h5 class="modal-title">Toggle Events</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
            </button>
        </div>
        <div class="modal-body">
        </div>
    </div>`

    document.getElementById('profileModal').before(eventMod);

    var modalBody = document.querySelector('[id=eventModal] div div [class=modal-body]')
    //Event order seems to change on startup so this loads them independent of order, also loads any new events without images
    for (const event of App.game.specialEvents.events) {
        let title = event.title;
        let description = event.description;
        switch(title){
            case "Flying Pikachu":
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br>
                <img src="assets/images/pokemon/25.1.png">
                <img src="assets/images/pokemon/21.01.png">
                </div><hr>`
                break
            case "Mewtwo strikes back!":
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br>
                <img src="assets/images/pokemon/150.03.png">
                <img src="assets/images/pokemon/1.01.png">
                <img src="assets/images/pokemon/4.01.png">
                <img src="assets/images/pokemon/7.01.png">
                </div><hr>`
                break
            case "Halloween!":
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br>
                <img src="assets/images/pokemon/1.02.png">
                <img src="assets/images/pokemon/25.12.png">
                <img src="assets/images/pokemon/175.01.png"><br>
                <img src="assets/images/pokemon/92.png">
                <img src="assets/images/pokemon/200.png">
                <img src="assets/images/pokemon/353.png">
                <img src="assets/images/pokemon/355.png">
                </div><hr>`
                break
            case "Let's GO!":
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br>
                <img src="assets/images/pokemon/25.13.png">
                <img src="assets/images/pokemon/133.02.png">
                </div><hr>`
                break
            case "Merry Christmas!":
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br>
                <img src="assets/images/pokemon/143.02.png">
                <img src="assets/images/pokemon/251.01.png">
                <img src="assets/images/pokemon/446.01.png">
                </div><hr>`
                break
            case "Hoopa Day":
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br>
                <i>(Note that this event only adds a special joke questline and doesn't add Hoopa as an additional roamer. Hoopa is available without this event.)</i><br>
                <img src="assets/images/pokemon/720.png">
                </div><hr>`
                break
            case "Lunar New Year":
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br>
                <img src="assets/images/pokemon/666.png">
                <img src="assets/images/pokemon/666.19.png"><br>
                <img src="assets/images/pokemon/666.01.png">
                <img src="assets/images/pokemon/666.02.png">
                <img src="assets/images/pokemon/666.03.png">
                <img src="assets/images/pokemon/666.04.png">
                <img src="assets/images/pokemon/666.05.png">
                <img src="assets/images/pokemon/666.06.png">
                <img src="assets/images/pokemon/666.07.png">
                <img src="assets/images/pokemon/666.08.png">
                <img src="assets/images/pokemon/666.09.png">
                <img src="assets/images/pokemon/666.1.png">
                <img src="assets/images/pokemon/666.11.png">
                <img src="assets/images/pokemon/666.12.png">
                <img src="assets/images/pokemon/666.13.png">
                <img src="assets/images/pokemon/666.14.png">
                <img src="assets/images/pokemon/666.15.png">
                <img src="assets/images/pokemon/666.16.png">
                <img src="assets/images/pokemon/666.17.png">
                <img src="assets/images/pokemon/666.18.png">
                </div><hr>`
                break
            case "Easter":
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br>
                <img src="assets/images/pokemon/175.02.png">
                </div><hr>`
                break
            case "Golden Week":
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br>
                <img src="assets/images/pokemon/1.03.png">
                </div><hr>`
                break
            case "Ephenia's Gift":
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br>
                <img src="assets/images/pokemon/743.png">
                </div><hr>`
                break
            default:
                modalBody.innerHTML +=
                    `<div id="event-${title}" class="event-select" data-value="${title}"><b>${title}</b><br>${description}<br><br>New event, Pokemon images coming soon, if not open an issue on github
                </div><hr>`
        }
    }

    for (const event of App.game.specialEvents.events) {
        if (activeSeasonalEvents[event.title]) {
            document.getElementById('event-'+event.title).style = "background-color: rgba(93, 226, 60, 0.5)";
        }
        document.getElementById('event-'+event.title).addEventListener('click', toggleEvent);
    }

    addGlobalStyle('.event-select { cursor: pointer; }');
    addGlobalStyle('.event-select:hover { background-color: rgba(48, 197, 255, 0.5); }');
}

function toggleEvent() {
    var title = this.getAttribute('data-value');
    activeSeasonalEvents[title] = !activeSeasonalEvents[title];
    localStorage.setItem(title, activeSeasonalEvents[title]);
    if (activeSeasonalEvents[title]) {
        this.style = "background-color: rgba(93, 226, 60, 0.5)";
        App.game.specialEvents.events.find((event) => (event.title === title)).start();
    } else {
        this.style = "";
        App.game.specialEvents.events.find((event) => (event.title === title)).end();
    }
}

function loadSetting(key, defaultVal) {
    var val;
    try {
        val = JSON.parse(localStorage.getItem(key));
        if (val == null || typeof val !== typeof defaultVal) {
            throw new Error;
        }
    } catch {
        val = defaultVal;
        localStorage.setItem(key, defaultVal);
    }
    return val;
}

//Made this script load like the others for consistency
function loadScript() {
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args);
        if (App.game && !hasInitialized) {
            initEvents();
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
