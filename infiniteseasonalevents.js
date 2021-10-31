// ==UserScript==
// @name        [Pokeclicker] Infinite Seasonal Events
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.0
// @author      Ephenia
// @description Adds in toggable options to have seasonal events infinitely run. Events can also run simultaneously with one another. Includes custom events as well.
// ==/UserScript==

var startDate = new Date(new Date().getFullYear(), -1);
var endDate = new Date(new Date().getFullYear(), 10000);
var getEvents = SpecialEvents.events;
var storedEvents = [];
var profileDrop = document.getElementById('startMenu').querySelectorAll('ul li')[0];
var profileModal = document.getElementById('profileModal');

SpecialEvents.newEvent('Ephenia\'s Gift', 'Encounter Ribombee that roams across all regions.<br/>A special thanks for using my scripts!',
    startDate, () => {
        GameHelper.enumNumbers(GameConstants.Region).filter(i => i != GameConstants.Region.none).forEach(region => {
            RoamingPokemonList.add(region, new RoamingPokemon('Ribombee'));
        });
    },
    startDate, () => {
        GameHelper.enumNumbers(GameConstants.Region).filter(i => i != GameConstants.Region.none).forEach(region => {
            RoamingPokemonList.remove(region, new RoamingPokemon('Ribombee'));
        });
    }
);

setTimeout(() => {
    for (var i = 0; i < getEvents.length; i++) {
        if (localStorage.getItem('specialEvent'+i) == null) {
            localStorage.setItem('specialEvent'+i, 0);
        }
        storedEvents.push(+localStorage.getItem('specialEvent'+i))
    }

    for (var ii = 0; ii < getEvents.length; ii++) {
        getEvents[ii].startTime = startDate
        getEvents[ii].endTime = endDate
        if (getEvents[ii].hasStarted() == false && storedEvents[ii] == 1) {
            getEvents[ii].start()
        }
    }
    initEvents();
    if (getEvents.length != 7) {
        setTimeout(() => {
            Notifier.notify({
                title: '[Outdated] Infinite Seasonal Events',
                message: `Please contact <a href="//github.com/Ephenia/Pokeclicker-Scripts" target="_blank">Ephenia</a> so that this script can be updated!`,
                type: NotificationConstants.NotificationOption.danger,
                timeout: 10000
            });
        }, 2000);
    }
}, 50);


function initEvents() {
    setTimeout(() => {
        for (var iii = 0; iii < getEvents.length; iii++) {
            var eventNotify = document.querySelectorAll('.ml-2');
            if (eventNotify.length >= iii + 1) {
                eventNotify[iii].click()
            }
        }

        var eventLi = document.createElement('li');
        eventLi.innerHTML = `<a class="dropdown-item" href="#eventModal" data-toggle="modal">Events</a>`
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
                <h5 class="modal-title">Events</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="modal-body">
            <div id="event-1" class="event-select" data-value="0"><b>`+getEvents[0].title+`</b><br>`+getEvents[0].description+`<br>
            <img src="assets/images/pokemon/666.19.png">
            </div><hr>
            <div id="event-2" class="event-select" data-value="1"><b>`+getEvents[1].title+`</b><br>`+getEvents[1].description+`<br>
            <img src="assets/images/pokemon/-1.png">
            </div><hr>
            <div id="event-3" class="event-select" data-value="2"><b>`+getEvents[2].title+`</b><br>`+getEvents[2].description+`<br>
            <img src="assets/images/pokemon/-3.png">
            <img src="assets/images/pokemon/-10.png">
            <img src="assets/images/pokemon/-13.png">
            <img src="assets/images/pokemon/-16.png">
            </div><hr>
            <div id="event-4" class="event-select" data-value="3"><b>`+getEvents[3].title+`</b><br>`+getEvents[3].description+`<br>
            <img src="assets/images/pokemon/-6.png">
            <img src="assets/images/pokemon/-5.png">
            <img src="assets/images/pokemon/-7.png"><br>
            <img src="assets/images/pokemon/92.png">
            <img src="assets/images/pokemon/200.png">
            <img src="assets/images/pokemon/353.png">
            <img src="assets/images/pokemon/355.png">
            </div><hr>
            <div id="event-5" class="event-select" data-value="4"><b>`+getEvents[4].title+`</b><br>`+getEvents[4].description+`<br>
            <img src="assets/images/pokemon/-9.png">
            <img src="assets/images/pokemon/-8.png">
            </div><hr>
            <div id="event-6" class="event-select" data-value="5"><b>`+getEvents[5].title+`</b><br>`+getEvents[5].description+`<br>
            <img src="assets/images/pokemon/-4.png">
            </div><hr>
            <div id="event-7" class="event-select" data-value="6"><b>`+getEvents[6].title+`</b><br>`+getEvents[6].description+`<br>
            <img src="assets/images/pokemon/743.png">
            </div><hr>
            <div>
        </div>
    </div>`
        profileModal.before(eventMod);

        for (var add = 0; add < getEvents.length; add++) {
            if (storedEvents[add] == 1) {
                document.getElementById('event-'+(add+1)).style = "background-color: rgba(93, 226, 60, 0.5)"
            }
            $("#event-"+(add+1)).click (toggleEvent)
        }

        addGlobalStyle('.event-select { cursor: pointer; }');
        addGlobalStyle('.event-select:hover { background-color: rgba(48, 197, 255, 0.5); }');
    }, 1450);
}

function toggleEvent() {
    var getVal = this.getAttribute('data-value');
    var getEvent = +localStorage.getItem('specialEvent'+getVal)
    if (getEvent == 0) {
        this.style = "background-color: rgba(93, 226, 60, 0.5)"
        storedEvents[getVal] = 1
        localStorage.setItem('specialEvent'+getVal, 1)
        getEvents[getVal].start()
    } else {
        this.style = ""
        storedEvents[getVal] = 0
        localStorage.setItem('specialEvent'+getVal, 0)
        getEvents[getVal].end()
    }
    console.log(getVal)
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
