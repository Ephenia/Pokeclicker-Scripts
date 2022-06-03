// ==UserScript==
// @name        [Pokeclicker] Auto Quest Completer
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.2
// @author      KarmaAlex (Credit: Ephenia, Sorrow)
// @description Removes the limit for the number of quests you can do at once and auto completes/starts new ones.
// ==/UserScript==

let questTypes = [];
let autoQuestCanBeStopped;
let questLocationReadyToStart = false;
let questLocationInProgress = false;
let questPokeballReadyToStart = false;
let questPokeballInProgress = false;
let completeQuestLocationLoop;
let completeQuestPokeballLoop;
let regionSelect;
let subRegionSelect;
let routeSelect;
let townSelect;
let dungeonStateSelect;
let gymStateSelect;
let pokeballAlreadyCaughtSelect;
let dungeonQuestEnable;
let gymStart;
let dungeonStart;

function initAutoQuests(){
    //Allows to start infinite  quests
    App.game.quests.canStartNewQuest = function(){
        return true;
    }
    //Create localStorage variable to enable/disable auto quests
    if (localStorage.getItem('autoQuestEnable') == null){
        localStorage.setItem('autoQuestEnable', 'true')
    }
    //Define quest types
    if (localStorage.getItem('autoQuestTypes') == null){
        for (const type in QuestHelper.quests) {
            questTypes.push(type);
        }
        localStorage.setItem('autoQuestTypes', JSON.stringify(questTypes))
    } else {
        questTypes = JSON.parse(localStorage.getItem('autoQuestTypes'));
        dungeonQuestEnable = questTypes.includes("DefeatDungeonQuest");
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
    //Retrieving autoclicker buttons
    gymStart = document.getElementById("auto-gym-start");
    dungeonStart = document.getElementById("auto-dungeon-start");

    //Checks for new quests to add to the list and claims completed ones
    var autoQuest = setInterval(function(){
        let questsNeed = 0;
        if (trackRefresh != App.game.quests.lastRefresh) {
            trackRefresh = App.game.quests.lastRefresh;
            stopCompleteQuestLocation();
            //Reload quest types from local storage to re-enter the dungeon if they are deleted because there are not enough dungeon tokens left.
            questTypes = JSON.parse(localStorage.getItem('autoQuestTypes'));
            resetQuestModify();
        }
        if (localStorage.getItem('autoQuestEnable') == 'true'){
            autoQuestCanBeStopped = true;
            if (App.game.quests.currentQuests().length > 0){
                App.game.quests.currentQuests().forEach(quest => {
                    if (quest.notified == true){
                        //Claim all completed quest
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
                        if (!questPokeballInProgress) {
                            if (quest instanceof UsePokeballQuest) {
                                completeUsePokeballQuest(quest)
                            }
                        }

                    }
                    //Complete quest when you use pokeball to capture pokemon like shiny and type
                    if (App.game.gameState === GameConstants.GameState.fighting) {
                        changePokeballForQuest(quest)
                    }

                    //TODO: For "CapturePokemonsQuest" and "CapturePokemonTypesQuest"
                    //If autohatchery exist start and sort pokemon
                    //Else use changePokeballForQuest() for "CapturePokemonsQuest"

                    //Check if quests should refresh
                    if (questTypes.includes(quest.constructor.name)) {
                        questsNeed++;
                    }
                })
            } else if (App.game.quests.currentQuests().length == 0) {
                //Quest refresh handling
                if (questsNeed == 0 && App.game.quests.canAffordRefresh()) {
                    App.game.quests.refreshQuests();
                }
            }
            //Attempt to start all available quests & quit the filtered ones
            App.game.quests.questList().forEach(quest => {
                if (quest.inProgress() == true && !questTypes.includes(quest.constructor.name)) {
                    App.game.quests.quitQuest(quest.index);
                } else if (quest.isCompleted() == false && quest.inProgress() == false && questTypes.includes(quest.constructor.name)){
                    App.game.quests.beginQuest(quest.index);
                }
            })
        } else if (autoQuestCanBeStopped) {
            autoQuestCanBeStopped = false;
            endPokeballQuest();
            stopCompleteQuestLocation();
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
        if (indexPos != -1) {
            questTypes[indexPos] = null;
        } else if (indexPos == -1) {
            const empty = questTypes.indexOf(null);
            questTypes[empty] = questName;
        }
        localStorage.setItem('autoQuestTypes', JSON.stringify(questTypes));
    }

    function stopCompleteQuestLocation() {
        if(questLocationInProgress) {
            //Reset loop when quest is refreshed or auto quest is disabled
            if(typeof completeQuestLocationLoop !== 'undefined') {
                clearInterval(completeQuestLocationLoop);
                completeQuestLocationLoop = null;
            }
            stopAutoDungeon();
            stopAutoGym();
            let resetPlayerStateLoop = setInterval(function() {
                if(playerCanMove()) {
                    playerResetState();
                    clearInterval(resetPlayerStateLoop);
                }
            }, 50);
            questLocationInProgress = false;
        }
        questLocationReadyToStart = false;
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

function endLocationQuest() {
    //Executed when the quest is completed
    questLocationReadyToStart = false;
    questLocationInProgress = false;
    clearInterval(completeQuestLocationLoop);
    completeQuestLocationLoop = null;
    stopAutoDungeon();
    stopAutoGym();
    playerResetState();
}

function endPokeballQuest() {
    //Executed when the quest is completed
    questPokeballInProgress = false;
    clearInterval(completeQuestPokeballLoop);
    completeQuestPokeballLoop = null;
    if (questPokeballReadyToStart) {
        playerSetAlreadyCaughtPokeball(pokeballAlreadyCaughtSelect);
        questPokeballReadyToStart = false;
    }
}

function endShiniesQuest() {
    if (pokeballAlreadyCaughtSelect) {
        playerSetAlreadyCaughtPokeball(pokeballAlreadyCaughtSelect);
    }
}

function completeDefeatDungeonQuest(dungeonQuest) {
    //Can't farm the dungeons without the autoclicker
    if(!dungeonStart) return;

    //Remove dungeon quest for current cycle if total token needed not available
    const indexPos = questTypes.indexOf("DefeatDungeonQuest");
    if(!playerCanPayDungeonEntrance(dungeonQuest.dungeon, dungeonQuest.progressText())) {
        if(indexPos !== -1) {
            questTypes[indexPos] = null;
        }
        endLocationQuest();
        return;
    }

    if(!questLocationReadyToStart) {
        playerSaveState();
        stopAutoGym();
        questLocationReadyToStart = true;
    }

    //Move player to quest dungeon
    if (playerCanMove()) {
        playerMoveToTown(dungeonQuest.dungeon, dungeonQuest.region);
    }

    if(player.town().name === dungeonQuest.dungeon) {
        questLocationInProgress = true;
        completeQuestLocationLoop = setInterval(function() {
            if(!dungeonQuest.notified) {
                if(dungeonStart && !dungeonStart.classList.contains("btn-success")) {
                    dungeonStart.click();
                }
            } else if(playerCanMove()) {
                endLocationQuest();
            }
        }, 50);
    }
}

function completeDefeatGymQuest(gymQuest) {
    //Find town associate to gym
    const gymListAsArray = Object.entries(GymList);
    const town = gymListAsArray.filter(([key, value]) => key === gymQuest.gymTown)[0][1];

    if(!questLocationReadyToStart) {
        playerSaveState();
        stopAutoDungeon();
        stopAutoGym();
        questLocationReadyToStart = true;
    }
    //Move player to quest town
    if (playerCanMove()) {
        playerMoveToTown(town.parent.name, town.parent.region);
    }

    if(player.town().name === town.parent.name) {
        //Find gym in town
        for(const gym of player.town().content) {
            if(gym.town === gymQuest.gymTown) {
                questLocationInProgress = true;
                completeQuestLocationLoop = setInterval(function() {
                    if(!gymQuest.notified) {
                        if(App.game.gameState !== GameConstants.GameState.gym) {
                            gym.protectedOnclick();
                        }
                    } else if(playerCanMove()) {
                        endLocationQuest();
                    }
                }, 50);
            }
        }
    }
}

function completeDefeatPokemonQuest(pokemonQuest) {
    if(!questLocationReadyToStart) {
        playerSaveState();
        stopAutoDungeon();
        stopAutoGym();
        questLocationReadyToStart = true;
    }

    //Move player to quest route
    if (playerCanMove()) {
        playerMoveToRoute(pokemonQuest.route, pokemonQuest.region);
    }

    if(player.route() === pokemonQuest.route && player.region === pokemonQuest.region) {
        questLocationInProgress = true;
        completeQuestLocationLoop = setInterval(function() {
            if(pokemonQuest.notified) {
                endLocationQuest();
            }
        }, 50);
    }
}

function completeUsePokeballQuest(pokeballQuest) {
    if (!questPokeballInProgress) {
        //Remove use pokeball quest for current cycle if total pokeball needed not available
        const indexPos = questTypes.indexOf("UsePokeballQuest");
        if(!playerHasPokeballForPokemonQuest(pokeballQuest.pokeball, pokeballQuest.progressText())) {
            if(indexPos !== -1) {
                questTypes[indexPos] = null;
            }
            endPokeballQuest();
            return;
        }

        questPokeballInProgress = true;

        //Save and set pokeball already caught selection
        if (!questPokeballReadyToStart) {
            playerSavePokeballAlreadyCaught();
        }
        playerSetAlreadyCaughtPokeball(pokeballQuest.pokeball)

        completeQuestPokeballLoop = setInterval(function() {
            if(pokeballQuest.notified) {
                endPokeballQuest()
            }
        }, 1000);
    }
}

function changePokeballForQuest(quest) {
    let catchShiniesQuest = App.game.quests.currentQuests().filter(x => x instanceof CatchShiniesQuest);
    let capturePokemonTypesQuest = App.game.quests.currentQuests().filter(x => x instanceof CapturePokemonTypesQuest);

    let forceCapture = false;
    if (App.game.pokeballs.alreadyCaughtSelection < GameConstants.Pokeball.Ultraball || questPokeballReadyToStart) {
        if (catchShiniesQuest.length > 0) {
            if (Battle.enemyPokemon().shiny || DungeonBattle.enemyPokemon().shiny) {
                forceCapture = true;
            }
        }
        if (capturePokemonTypesQuest.length > 0) {
            for(const quest of capturePokemonTypesQuest) {
                if(quest.type === Battle.enemyPokemon().type1 || quest.type === Battle.enemyPokemon().type2) {
                    forceCapture = true;
                    break;
                }
            }
        }

        if (forceCapture) {
            //Check if player have pokeball to catch pokemon
            let pokeball = -1;
            for (let i = GameConstants.Pokeball.Ultraball; i >= 0; i--) {
                if(playerHasPokeballForPokemonQuest(i)) {
                    pokeball = i;
                    break;
                }
            }
            if (pokeball === -1) {
                const indexPos = questTypes.indexOf(quest.constructor.name);
                if(indexPos !== -1) {
                    questTypes[indexPos] = null;
                }
                return;
            }
            if (!questPokeballReadyToStart) {
                playerSavePokeballAlreadyCaught();
            }
            playerSetAlreadyCaughtPokeball(pokeball)
        } else if (questPokeballReadyToStart && !questPokeballInProgress) {
            playerSetAlreadyCaughtPokeball(pokeballAlreadyCaughtSelect)
            questPokeballReadyToStart = false;
        }
    }
}

function playerSaveState() {
    //Save last location of player in temp variable
    regionSelect = player.region;
    subRegionSelect = player.subregion;
    routeSelect = player.route();
    townSelect = player.town().name;

    if(dungeonStart && dungeonStart.classList.contains("btn-danger")) {
        dungeonStateSelect = false;
    } else if(dungeonStart && dungeonStart.classList.contains("btn-success")) {
        dungeonStateSelect = true;
    }
    if(gymStart && gymStart.classList.contains("btn-danger")) {
        gymStateSelect = false;
    } else if(gymStart && gymStart.classList.contains("btn-success")) {
        gymStateSelect = true;
    }
}

function playerSavePokeballAlreadyCaught() {
    pokeballAlreadyCaughtSelect = App.game.pokeballs.alreadyCaughtSelection;
    questPokeballReadyToStart = true;
}

function playerResetState() {
    if(regionSelect && player.region !== regionSelect) {
        player.region = regionSelect;
    }
    if(subRegionSelect && player.subregion !== subRegionSelect) {
        player.subregion = subRegionSelect;
    }
    if(routeSelect && player.route() !== routeSelect) {
        MapHelper.moveToRoute(routeSelect, regionSelect);
    }
    if(townSelect && routeSelect === 0) {
        MapHelper.moveToTown(townSelect);
    }
    if (dungeonStart) {
        if(dungeonStateSelect && !dungeonStart.classList.contains("btn-success")) {
            dungeonStart.click();
        } else if(!dungeonStateSelect && !dungeonStart.classList.contains("btn-danger")) {
            dungeonStart.click();
        }
    }
    if (gymStart) {
        if(gymStateSelect && !gymStart.classList.contains("btn-success")) {
            gymStart.click();
        } else if(!gymStateSelect && !gymStart.classList.contains("btn-danger")) {
            gymStart.click();
        }
    }
}

function playerCanMove() {
    return !DungeonRunner.fighting() && !DungeonRunner.fightingBoss() && !DungeonBattle.catching() && !GymRunner.running()
}

function playerMoveToTown(town, region) {
    if(player.region !== region || player.town().name !== town) {
        player.region = region;
        if(region === 6) {
            setAlolaSubRegion(town)
        } else {
            player.subregion = 0
        }
        MapHelper.moveToTown(town);
    }
}

function playerMoveToRoute(route, region) {
    if(player.region !== region || player.route() !== route) {
        player.region = region;
        if(region === 6) {
            setAlolaSubRegion(route)
        } else {
            player.subregion = 0
        }
        MapHelper.moveToRoute(route, region);
    }
}

function playerCanPayDungeonEntrance(dungeonName, progressText) {
    const dungeon = Object.entries(TownList).filter(([key, value]) => key === dungeonName)[0][1].dungeon
    let getTokens = App.game.wallet.currencies[GameConstants.Currency.dungeonToken]();
    let dungeonCost = dungeon.tokenCost;
    let progress = progressText.split('/').map(element => parseInt(element.trim()));
    let amountRemaining = progress[1] - progress[0];
    return getTokens >= dungeonCost * amountRemaining;
}

function playerHasPokeballForPokemonQuest(pokeball, progressText = null) {
    let amountRemaining = 0;
    if (progressText) {
        const progress = progressText.split('/').map(element => parseInt(element.trim()));
        amountRemaining = progress[1] - progress[0];
    } else {
        amountRemaining = 1;
    }
    return App.game.pokeballs.pokeballs[pokeball].quantity() >= amountRemaining;
}

function playerSetAlreadyCaughtPokeball(pokeball) {
    if (App.game.pokeballs.alreadyCaughtSelection !== pokeball) {
        App.game.pokeballs._alreadyCaughtSelection(pokeball);
    }
}

function stopAutoDungeon() {
    if(dungeonStart && !dungeonStart.classList.contains("btn-danger")) {
        dungeonStart.click();
    }
}

function stopAutoGym() {
    if(gymStart && !gymStart.classList.contains("btn-danger")) {
        gymStart.click();
    }
}

function setAlolaSubRegion(locationName) {
    //TODO: Find a solution to retrieve locations by sub-region in a programmatic way
    //On Alola map subregion not available on Town, Route or Dungeon
    //Location found from https://github.com/pokeclicker/pokeclicker/blob/ff8b53478cf714c61de8b33d73cd1275ce785688/src/components/AlolaSVG.html
    const alolaSubregion0 = ["Route 1", "Route 1 Hau'oli Outskirts", "Route 2", "Route 3", "Melemele Sea", "Kala'e Bay", "Iki Town Outskirts", "Iki Town", "Professor Kukui\'s Lab", "Hau'oli City", "Melemele Woods", "Roadside Motel", "Trainers School", "Hau'oli Cemetery", "Seaward Cave", "Ten Carat Hill"];
    const alolaSubregion1 = ["Route 4", "Route 5", "Route 6", "Route 7", "Route 8", "Route 9", "Akala Outskirts", "Heahea City", "Paniola Town", "Royal Avenue", "Konikoni City", "Aether Paradise", "Roadside Motel", "Pikachu Valley", "Paniola Ranch", "Brooklet Hill", "Wela Volcano Park", "Lush Jungle", "Diglett's Tunnel", "Memorial Hill", "Aether Foundation", "Ruins of Life"];
    const alolaSubregion2 = ["Route 10", "Mount Hokulani", "Route 11", "Route 12", "Route 13", "Haina Desert", "Route 14", "Route 15", "Route 16", "Route 17", "Poni Wilds", "Ancient Poni Path", "Poni Breaker Coast", "Poni Grove", "Poni Plains", "Poni Coast", "Poni Gauntlet", "Aether Paradise", "Malie City", "Tapu Village", "Seafolk Village", "Exeggutor Island", "Altar of the Sunne and Moone", "Pokémon League Alola", "Vast Poni Canyon", "Lake of the Sunne and Moone"];

    if(alolaSubregion0.includes(locationName)) {
        player.subregion = 0
    } else if(alolaSubregion1.includes(locationName)) {
        player.subregion = 1
    } else if(alolaSubregion2.includes(locationName)) {
        player.subregion = 2
    }
}