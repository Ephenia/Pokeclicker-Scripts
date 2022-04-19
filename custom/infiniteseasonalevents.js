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

//Made this script load like the others for consistency
function loadScript(){
    var scriptLoad = setInterval(function () {
        try {
            newSave = document.querySelectorAll('label')[0];
            trainerCards = document.querySelectorAll('.trainer-card');
        } catch (err) { }
        if (typeof newSave != 'undefined') {
            for (var i = 0; i < trainerCards.length; i++) {
                trainerCards[i].addEventListener('click', initEvents, false);
            }
            newSave.addEventListener('click', initEvents, false);
            clearInterval(scriptLoad)
        }
    }, 50);
}

var scriptName = 'infiniteseasonalevents'

if (document.getElementById('scriptHandler') != undefined){
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) != null){
        if (localStorage.getItem(scriptName) == 'true'){
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


//Removed setTimeout, opted to make it load like the other scrips, also helps with notifications
function initEvents() {
    //Testing loading events in init
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
            if (ii != 1){
                getEvents[ii].start()
            }
            
        }
    }
    //initEvents();
    if (getEvents.length != 8) {
        setTimeout(() => {
            Notifier.notify({
                title: '[Outdated] Infinite Seasonal Events',
                message: `Please contact <a href="//github.com/Ephenia/Pokeclicker-Scripts" target="_blank">Ephenia</a> so that this script can be updated!`,
                type: NotificationConstants.NotificationOption.danger,
                timeout: 10000
            });
        }, 2000);
    }

    
    //Why is clearing notifications so hard
    var cleared = 0;
    var clearNotifs = setInterval(function (){
        var eventNotify = document.getElementById('toaster');
        for (var i = 0; i< eventNotify.childNodes.length; i++){
            if (eventNotify.childNodes[0].childNodes[1].textContent.includes('EVENT')){ 
                eventNotify.removeChild(eventNotify.childNodes[0])
                cleared++
            }
        }
        //For some reason some notifications appear twice even if the script runs once so 15 need to be cleared
        if (cleared >= 15){ clearInterval(clearNotifs) }
    }, 100)
    
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
    //Added easter event, up to date as of 15/04/22
    eventMod.innerHTML = `<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header" style="justify-content: space-around;">
            <h5 class="modal-title">Toggle Events</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
            </button>
        </div>
        <div class="modal-body">
        <div id="event-1" class="event-select" data-value="0"><b>`+getEvents[0].title+`</b><br>`+getEvents[0].description+`<br>
        <img src="assets/images/pokemon/666.19.png">
        </div><hr>
        <div id="event-2" class="event-select" data-value="1"><b>`+getEvents[1].title+`</b><br>`+getEvents[1].description+`<br>
        <img src="assets/images/pokemon/175.2.png">
        </div><hr>
        <div id="event-3" class="event-select" data-value="2"><b>`+getEvents[2].title+`</b><br>`+getEvents[2].description+`<br>
        <img src="assets/images/pokemon/-1.png">
        </div><hr>
        <div id="event-4" class="event-select" data-value="3"><b>`+getEvents[3].title+`</b><br>`+getEvents[3].description+`<br>
        <img src="assets/images/pokemon/-3.png">
        <img src="assets/images/pokemon/-10.png">
        <img src="assets/images/pokemon/-13.png">
        <img src="assets/images/pokemon/-16.png">
        </div><hr>
        <div id="event-5" class="event-select" data-value="4"><b>`+getEvents[4].title+`</b><br>`+getEvents[4].description+`<br>
        <img src="assets/images/pokemon/-6.png">
        <img src="assets/images/pokemon/-5.png">
        <img src="assets/images/pokemon/-7.png"><br>
        <img src="assets/images/pokemon/92.png">
        <img src="assets/images/pokemon/200.png">
        <img src="assets/images/pokemon/353.png">
        <img src="assets/images/pokemon/355.png">
        </div><hr>
        <div id="event-6" class="event-select" data-value="5"><b>`+getEvents[5].title+`</b><br>`+getEvents[5].description+`<br>
        <img src="assets/images/pokemon/-9.png">
        <img src="assets/images/pokemon/-8.png">
        </div><hr>
        <div id="event-7" class="event-select" data-value="6"><b>`+getEvents[6].title+`</b><br>`+getEvents[6].description+`<br>
        <img src="assets/images/pokemon/-4.png">
        </div><hr>
        <div id="event-8" class="event-select" data-value="7"><b>`+getEvents[7].title+`</b><br>`+getEvents[7].description+`<br>
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
    //console.log(getVal)
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
