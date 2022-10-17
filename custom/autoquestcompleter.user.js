// ==UserScript==
// @name          [Pokeclicker] Auto Quest Completer
// @namespace     Pokeclicker Scripts
// @author        KarmaAlex (Credit: Ephenia)
// @description   Removes the limit for the number of quests you can do at once and auto completes/starts new ones.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.1

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/autoquestcompleter.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/autoquestcompleter.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

function initAutoQuests(){
    //Allows to start infinite  quests
    App.game.quests.canStartNewQuest = function(){
        return true;
    }
    //Create localStorage variable to enable/disable auto quests
    if (localStorage.getItem('autoQuestEnable') === null){
        localStorage.setItem('autoQuestEnable', 'true')
    }
    //Define quest types
    let questTypes = [];
    if (localStorage.getItem('autoQuestTypes') === null){
        for (const type in QuestHelper.quests) {
            questTypes.push(type);
        }
        localStorage.setItem('autoQuestTypes', JSON.stringify(questTypes))
    } else {
        questTypes = JSON.parse(localStorage.getItem('autoQuestTypes'));
    }
    resetQuestModify();
    //Track the last refresh
    let trackRefresh = App.game.quests.lastRefresh;
    //Add button
    var autoQuestBtn = document.createElement('button')
    autoQuestBtn.id = 'toggle-auto-quest'
    autoQuestBtn.className = localStorage.getItem('autoQuestEnable') === 'true' ? 'btn btn-block btn-success' : 'btn btn-block btn-danger'
    autoQuestBtn.style = 'position: absolute; left: 0px; top: 0px; width: auto; height: 41px; font-size: 9px;'
    autoQuestBtn.textContent = localStorage.getItem('autoQuestEnable') === 'true' ? 'Auto [ON]' : 'Auto [OFF]'
    document.getElementById('questDisplayContainer').appendChild(autoQuestBtn)
    //Add function to toggle auto quests
    document.getElementById('toggle-auto-quest').addEventListener('click',() => {
        if (localStorage.getItem('autoQuestEnable') === 'true'){
            localStorage.setItem('autoQuestEnable', 'false')
            document.getElementById('toggle-auto-quest').className = 'btn btn-block btn-danger'
            document.getElementById('toggle-auto-quest').textContent = 'Auto [OFF]'
        }
        else{
            localStorage.setItem('autoQuestEnable', 'true')
            document.getElementById('toggle-auto-quest').className = 'btn btn-block btn-success'
            document.getElementById('toggle-auto-quest').textContent = 'Auto [ON]'
        }
    }, false)

    //Checks for new quests to add to the list and claims completed ones
    /*var autoQuest = */setInterval(function(){
        let questsNeed = 0;
        if (trackRefresh !== App.game.quests.lastRefresh) {
            trackRefresh = App.game.quests.lastRefresh;
            resetQuestModify();
        }
        if (localStorage.getItem('autoQuestEnable') === 'true'){
            if (App.game.quests.currentQuests().length > 0){
                //Claim all completed quest & check if quests should refresh
                App.game.quests.currentQuests().forEach(quest => {
                    if (quest.notified === true){
                        App.game.quests.claimQuest(quest.index)
                    }
                    if (questTypes.includes(quest.constructor.name)) {
                        questsNeed++;
                    }
                })
            } else if (App.game.quests.currentQuests().length === 0) {
                //Quest refresh handling
                if (questsNeed === 0 && App.game.quests.canAffordRefresh()) {
                    App.game.quests.refreshQuests();
                }
            }
            //Attempt to start all available quests & quit the filtered ones
            App.game.quests.questList().forEach(quest => {
                if (quest.inProgress() === true && !questTypes.includes(quest.constructor.name)) {
                    App.game.quests.quitQuest(quest.index);
                } else if (quest.isCompleted() === false && quest.inProgress() === false && questTypes.includes(quest.constructor.name)){
                    App.game.quests.beginQuest(quest.index);
                }
            })
        }
    }, 500)

    function resetQuestModify() {
        //Selecting Quest list in Quest Modal and adding click listeners
        const questHTML = document.getElementById('QuestModal').querySelector('tbody').children;
        for (let i = 0; i < questHTML.length; i++) {
            questHTML[i].querySelector('td:nth-child(1)').setAttribute('data-src', i);
            questHTML[i].addEventListener('click', () => {retrieveQuestName(event)})
        }
    }

    function retrieveQuestName(event) {
        const index = +event.target.getAttribute('data-src');
        const questName = App.game.quests.questList()[index].constructor.name;
        const indexPos = questTypes.indexOf(questName);
        if (indexPos !== -1) {
            questTypes[indexPos] = null;
        } else if (indexPos === -1) {
            const empty = questTypes.indexOf(null);
            questTypes[empty] = questName;
        }
        localStorage.setItem('autoQuestTypes', JSON.stringify(questTypes));
    }
}

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initAutoQuests()
        return result
    }
}

var scriptName = 'autoquestcomplete'

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
