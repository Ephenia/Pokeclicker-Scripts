// ==UserScript==
// @name        [Pokeclicker] Auto Quest Completer
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.2
// @author      KarmaAlex (Credit: Ephenia, Sorrow)
// @description Removes the limit for the number of quests you can do at once and auto completes/starts new ones.
// ==/UserScript==

let questLocationInProgress = false;
let questLocationLoop;
let lastPlayerTown = null;
let lastPlayerRoute = null;
let lastPlayerRegion = null;

// const alola_gyms_subregion_0 = ["Iki Town"]
// const alola_gyms_subregion_1 = ["Konikoni City"]
// const alola_gyms_subregion_2 = ["Malie City", "Exeggutor Island", "Pokémon League Alola"]

function initAutoQuests() {
    //Allows to start infinite  quests
    App.game.quests.canStartNewQuest = function() {
        return true;
    }
    //Create localStorage variable to enable/disable auto quests
    if(localStorage.getItem('autoQuestEnable') == null) {
        localStorage.setItem('autoQuestEnable', 'true')
    }
    //Define quest types
    let questTypes = [];
    if(localStorage.getItem('autoQuestTypes') == null) {
        for(const type in QuestHelper.quests) {
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
    autoQuestBtn.className = localStorage.getItem('autoQuestEnable') == 'true' ? 'btn btn-block btn-success' : 'btn btn-block btn-danger'
    autoQuestBtn.style = 'position: absolute; left: 0px; top: 0px; width: auto; height: 41px; font-size: 9px;'
    autoQuestBtn.textContent = localStorage.getItem('autoQuestEnable') == 'true' ? 'Auto [ON]' : 'Auto [OFF]'
    document.getElementById('questDisplayContainer').appendChild(autoQuestBtn)
    //Add function to toggle auto quests
    document.getElementById('toggle-auto-quest').addEventListener('click', () => {
        if(localStorage.getItem('autoQuestEnable') == 'true') {
            localStorage.setItem('autoQuestEnable', 'false')
            document.getElementById('toggle-auto-quest').className = 'btn btn-block btn-danger'
            document.getElementById('toggle-auto-quest').textContent = 'Auto [OFF]'
        } else {
            localStorage.setItem('autoQuestEnable', 'true')
            document.getElementById('toggle-auto-quest').className = 'btn btn-block btn-success'
            document.getElementById('toggle-auto-quest').textContent = 'Auto [ON]'
        }
    }, false)

    //Checks for new quests to add to the list and claims completed ones
    var autoQuest = setInterval(function() {
        let questsNeed = 0;
        if(trackRefresh != App.game.quests.lastRefresh) {
            trackRefresh = App.game.quests.lastRefresh;
            resetQuestModify();
        }
        if(localStorage.getItem('autoQuestEnable') == 'true') {
            if(App.game.quests.currentQuests().length > 0) {
                //Claim all completed quest & check if quests should refresh
                App.game.quests.currentQuests().forEach(quest => {
                    if(quest.notified == true) {
                        App.game.quests.claimQuest(quest.index)
                    } else {
                        //Processes quests with location
                        if(!questLocationInProgress) {
                            if(quest instanceof DefeatGymQuest) {
                                completeDefeatGymQuest(quest)
                            } else if(quest instanceof DefeatPokemonsQuest) {
                                completeDefeatPokemonQuest(quest)
                            } else if(quest instanceof DefeatDungeonQuest) {
                                completeDefeatDungeonQuest(quest)
                            }
                        }
                    }
                    if(questTypes.includes(quest.constructor.name)) {
                        questsNeed++;
                    }
                })
            } else if(App.game.quests.currentQuests().length == 0) {
                //Quest refresh handling
                if(questsNeed == 0 && App.game.quests.canAffordRefresh()) {
                    App.game.quests.refreshQuests();
                }
            }
            //Attempt to start all available quests & quit the filtered ones
            App.game.quests.questList().forEach(quest => {
                if(quest.inProgress() == true && !questTypes.includes(quest.constructor.name)) {
                    App.game.quests.quitQuest(quest.index);
                } else if(quest.isCompleted() == false && quest.inProgress() == false && questTypes.includes(quest.constructor.name)) {
                    App.game.quests.beginQuest(quest.index);
                }
            })
        } else {
            resetQuestModify()
        }
    }, 500)

    function resetQuestModify() {
        //Selecting Quest list in Quest Modal and adding click listeners
        const questHTML = document.getElementById('QuestModal').querySelector('tbody').children;
        for(let i = 0; i < questHTML.length; i++) {
            questHTML[i].querySelector('td:nth-child(1)').setAttribute('data-src', i);
            questHTML[i].addEventListener('click', () => {
                retrieveQuestName(event)
            })
        }

        if (questLocationInProgress) {
            //Reset loop when quest is refreshed or auto quest is disabled
            if(typeof questLocationLoop !== 'undefined' || typeof questLocationLoop !== 'undefined') {
                clearInterval(questLocationLoop);
                questLocationLoop = null
            }
            moveToLastLocation()
            questLocationInProgress = false;
        }
    }

    function retrieveQuestName(event) {
        const index = +event.target.getAttribute('data-src');
        const questName = App.game.quests.questList()[index].constructor.name;
        const indexPos = questTypes.indexOf(questName);
        if(indexPos != -1) {
            questTypes[indexPos] = null;
        } else if(indexPos == -1) {
            const empty = questTypes.indexOf(null);
            questTypes[empty] = questName;
        }
        localStorage.setItem('autoQuestTypes', JSON.stringify(questTypes));
    }
}

function completeDefeatDungeonQuest(dungeonQuest) {
    //Can't farm the dungeons without the autoclicker
    if(document.getElementById("auto-dungeon-start") === null) return;
    getLastLocation();
    //Move player to quest dungeon
    if(player.town().name != dungeonQuest.dungeon && player.region != dungeonQuest.region) {
        MapHelper.moveToTown(dungeonQuest.dungeon);
        player.region = dungeonQuest.region;
    }
    if(player.town().name == dungeonQuest.dungeon) {
        questLocationInProgress = true;
        questLocationLoop = setInterval(function() {
            if(!dungeonQuest.notified) {
                // Start auto dungeon
                if(document.getElementById("auto-dungeon-start").classList.contains("btn-danger")) {
                    document.getElementById("auto-dungeon-start").click();
                }
            } else {
                //Stop auto dungeon
                if(document.getElementById("auto-dungeon-start").classList.contains("btn-success")) {
                    document.getElementById("auto-dungeon-start").click();
                }
                endQuest();
            }
        }, 50);
    }
}

function completeDefeatPokemonQuest(pokemonQuest) {
    getLastLocation()
    //Move player to quest route
    if(player.route() !== pokemonQuest.route && player.region != pokemonQuest.region) {
        MapHelper.moveToRoute(pokemonQuest.route, pokemonQuest.region);
        player.region = pokemonQuest.region;
    }
    if(player.route() === pokemonQuest.route && player.region === pokemonQuest.region) {
        questLocationInProgress = true;
        questLocationLoop = setInterval(function() {
            if(pokemonQuest.notified) {
                endQuest();
            }
        }, 50);
    }
}

function completeDefeatGymQuest(gymQuest) {
    getLastLocation()
    //Find town associate to gym
    const gymListAsArray = Object.entries(GymList);
    const town = gymListAsArray.filter(([key, value]) => key === gymQuest.gymTown)[0][1];
    //Move player to quest town
    if(player.town().name !== town.parent.name) {
        MapHelper.moveToTown(town.parent.name);
        player.region = town.parent.region;
        //On Alola map subregion not available on town
        // if (town.parent.region == 6) {
        //     if (alola_gyms_subregion_0.includes(town.parent.name)) {
        //         player.subregion = 0
        //     } else if (alola_gyms_subregion_1.includes(town.parent.name)) {
        //         player.subregion = 1
        //     } else if (alola_gyms_subregion_2.includes(town.parent.name)) {
        //         player.subregion = 2
        //     }
        // }
    }

    if(player.town().name === town.parent.name) {
        //Find gym in town
        for(const gym of player.town().content) {
            if(gym.town === gymQuest.gymTown) {
                questLocationInProgress = true;
                questLocationLoop = setInterval(function() {
                    if(!gymQuest.notified) {
                        if(App.game.gameState !== GameConstants.GameState.gym) {
                            gym.protectedOnclick();
                        }
                    } else {
                        endQuest();
                    }
                }, 50);
            }
        }
    }
}

function endQuest() {
    //Executed when the quest is completed
    questLocationInProgress = false;
    clearInterval(questLocationLoop);
    questLocationLoop = null;
    moveToLastLocation();
}

function getLastLocation() {
    //Save last location of player in temp variable
    lastPlayerRegion = player.region;
    lastPlayerRoute = player.route();
    lastPlayerTown = player.town().name;
}

function moveToLastLocation() {
    //Move player to last location before starting location quest
    if(null !== lastPlayerRegion && player.region != lastPlayerRegion && null !== lastPlayerRoute && player.route() != lastPlayerRoute) {
        MapHelper.moveToRoute(lastPlayerRoute, lastPlayerRegion);
        player.region = lastPlayerRegion;
    }
    if(null !== lastPlayerTown && player.town().name != lastPlayerTown && null !== lastPlayerRoute && lastPlayerRoute == 0) {
        MapHelper.moveToTown(lastPlayerTown);
    }
}

function loadScript() {
    var oldInit = Preload.hideSplashScreen;

    Preload.hideSplashScreen = function() {
        var result = oldInit.apply(this, arguments);
        initAutoQuests();
        return result;
    }
}

var scriptName = 'autoquestcomplete'

if(document.getElementById('scriptHandler') != undefined) {
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if(localStorage.getItem(scriptName) != null) {
        if(localStorage.getItem(scriptName) == 'true') {
            loadScript()
        }
    } else {
        localStorage.setItem(scriptName, 'true')
        loadScript()
    }
} else {
    loadScript();
}
