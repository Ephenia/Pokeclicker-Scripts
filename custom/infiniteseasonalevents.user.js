// ==UserScript==
// @name          [Pokeclicker] Infinite Seasonal Events
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   Adds in toggable options to have seasonal events infinitely run. Events can also run simultaneously with one another. Includes custom events as well.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.2

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

var startDate = new Date(new Date().getFullYear(), -1);
var endDate = new Date(new Date().getFullYear(), 10000);
var getEvents = SpecialEvents.events;
var storedEvents = [];
var profileDrop = document.getElementById('startMenu').querySelectorAll('ul li')[0];
var profileModal = document.getElementById('profileModal');

//Removed setTimeout, opted to make it load like the other scrips, also helps with notifications
function initEvents() {
    SpecialEvents.newEvent('Ephenia\'s Gift', 'Encounter Ribombee that roams across all regions.<br/>A special thanks for using my scripts!',
                           startDate, () => {
        GameHelper.enumNumbers(GameConstants.Region).filter(i => i != GameConstants.Region.none).forEach(region => {
            RoamingPokemonList.add(region, new RoamingPokemon('Ribombee'));
        });
    },
                           endDate, () => {
        GameHelper.enumNumbers(GameConstants.Region).filter(i => i != GameConstants.Region.none).forEach(region => {
            RoamingPokemonList.remove(region, 'Ribombee');
        });
    }
                          );

    //Testing loading events in init
    for (var i = 0; i < getEvents.length; i++) {
        if (localStorage.getItem(getEvents[i].title) == null) {
            localStorage.setItem(getEvents[i].title, 0);
        }
        /*
        Changed the storedEvents list to contain objects that have the name of the event and active status so we can search for them
        even with a different order
        */
        storedEvents.push({name: getEvents[i].title, active: localStorage.getItem(getEvents[i].title)})
    }

    for (var ii = 0; ii < getEvents.length; ii++) {
        getEvents[ii].startTime = startDate
        getEvents[ii].endTime = endDate
        if (getEvents[ii].hasStarted() == false && storedEvents[ii].active == 1) {
            getEvents[ii].start()
        }
    }

    if (getEvents.length != 10) {
        Notifier.notify({
            title: '[Outdated] Infinite Seasonal Events',
            message: `Please contact <a href="https://github.com/Ephenia/Pokeclicker-Scripts" target="_blank">Ephenia</a> so that this script can be updated!`,
            type: NotificationConstants.NotificationOption.danger,
            timeout: 10000
        });
    }

    var eventLi = document.createElement('li');
    eventLi.innerHTML = `<a class="dropdown-item" href="#eventModal" data-toggle="modal">Toggle Events</a>`
    profileDrop.before(eventLi);

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

    profileModal.before(eventMod);

    var modalBody = document.querySelector('[id=eventModal] div div [class=modal-body]')
    //Event order seems to change on startup so this loads them independent of order, also loads any new events without images
    for (i = 0; i<getEvents.length;i++){
        switch(getEvents[i].title){
            case "Flying Pikachu":
                modalBody.innerHTML +=
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br>
                <img src="assets/images/pokemon/25.1.png">
                <img src="assets/images/pokemon/21.01.png">
                </div><hr>`
                break
            case "Mewtwo strikes back!":
                modalBody.innerHTML +=
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br>
                <img src="assets/images/pokemon/150.03.png">
                <img src="assets/images/pokemon/1.01.png">
                <img src="assets/images/pokemon/4.01.png">
                <img src="assets/images/pokemon/7.01.png">
                </div><hr>`
                break
            case "Halloween!":
                modalBody.innerHTML +=
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br>
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
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br>
                <img src="assets/images/pokemon/25.13.png">
                <img src="assets/images/pokemon/133.02.png">
                </div><hr>`
                break
            case "Merry Christmas!":
                modalBody.innerHTML +=
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br>
                <img src="assets/images/pokemon/143.02.png">
                <img src="assets/images/pokemon/251.01.png">
                <img src="assets/images/pokemon/446.01.png">
                </div><hr>`
                break
            case "Hoopa Day":
                modalBody.innerHTML +=
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br>
                <i>(Note that this event only adds a special joke questline and doesn't add Hoopa as an additional roamer. Hoopa is available without this event.)</i><br>
                <img src="assets/images/pokemon/720.png">
                </div><hr>`
                break
            case "Lunar New Year":
                modalBody.innerHTML +=
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br>
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
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br>
                <img src="assets/images/pokemon/175.02.png">
                </div><hr>`
                break
            case "Golden Week":
                modalBody.innerHTML +=
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br>
                <img src="assets/images/pokemon/1.03.png">
                </div><hr>`
                break
            case "Ephenia's Gift":
                modalBody.innerHTML +=
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br>
                <img src="assets/images/pokemon/743.png">
                </div><hr>`
                break
            default:
                modalBody.innerHTML +=
                    `<div id="event-`+i+`" class="event-select" data-value="`+i+`"><b>`+getEvents[i].title+`</b><br>`+getEvents[i].description+`<br><br>New event, Pokemon images coming soon, if not open an issue on github
                </div><hr>`
        }
    }

    for (var add = 0; add < getEvents.length; add++) {
        if (storedEvents[add].active == 1) {
            document.getElementById('event-'+(add)).style = "background-color: rgba(93, 226, 60, 0.5)"
        }
        document.getElementById('event-'+(add)).addEventListener('click', toggleEvent, false)
    }

    addGlobalStyle('.event-select { cursor: pointer; }');
    addGlobalStyle('.event-select:hover { background-color: rgba(48, 197, 255, 0.5); }');
}

function toggleEvent() {
    var getVal = this.getAttribute('data-value');
    var getEvent = +localStorage.getItem(storedEvents[getVal].name)
    if (getEvent == 0) {
        this.style = "background-color: rgba(93, 226, 60, 0.5)"
        storedEvents[getVal].value = 1
        localStorage.setItem(storedEvents[getVal].name, 1)
        getEvents[getVal].start()
    } else {
        this.style = ""
        storedEvents[getVal].value = 0
        localStorage.setItem(storedEvents[getVal].name, 0)
        getEvents[getVal].end()
    }
    //console.log(getVal)
}

//Made this script load like the others for consistency
function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initEvents()
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
