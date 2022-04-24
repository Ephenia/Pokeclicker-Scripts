// ==UserScript==
// @name        [Pokeclicker] Auto Quest Completer
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.0
// @author      KarmaAlex
// @description Removes the limit for the number of quests you can do at once and auto completes/starts new ones.
// ==/UserScript==

function initAutoQuests(){
    //Allows to start infinite  quests
    App.game.quests.canStartNewQuest = function(){
        return true;
    }
    //Create localStorage variable to enable/disable auto quests
    if (localStorage.getItem('autoQuestEnable') == null){
        localStorage.setItem('autoQuestEnable', 'true')
    }
    //Add button
    var autoQuestBtn = document.createElement('button')
    autoQuestBtn.id = 'toggle-auto-quest'
    autoQuestBtn.className = localStorage.getItem('autoQuestEnable') == 'true' ? 'btn btn-block btn-success' : 'btn btn-block btn-danger'
    autoQuestBtn.style = 'position: absolute; left: 0px; top: 0px; width: auto; height: 41px; font-size: 9px;'
    autoQuestBtn.textContent = localStorage.getItem('autoQuestEnable') == 'true' ? 'Auto [ON]' : 'Auto [OFF]'
    document.getElementById('questDisplayContainer').appendChild(autoQuestBtn)
    //Add function to toggle auto quests
    document.getElementById('toggle-auto-quest').addEventListener('click',() => {
        if (localStorage.getItem('autoQuestEnable') == 'true'){
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
    var autoQuest = setInterval(function(){
        if (localStorage.getItem('autoQuestEnable') == 'true'){
            if (App.game.quests.currentQuests().length > 0){
                //Claim all completed quest
                App.game.quests.currentQuests().forEach(quest => {
                    if (quest.notified == true){
                        App.game.quests.claimQuest(quest.index)
                    }
                })
            }
            //Attempt to start all available quests
            App.game.quests.questList().forEach(quest => {
                if (quest.isCompleted() == false && quest.inProgress() == false){
                    App.game.quests.beginQuest(quest.index)
                }
            })
        }
    }, 500)
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