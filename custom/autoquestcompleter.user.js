// ==UserScript==
// @name        [Pokeclicker] Auto Quest Completer
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.2
// @author      KarmaAlex (Credit: Ephenia, Sorrow)
// @description Removes the limit for the number of quests you can do at once and auto completes/starts new ones.
// @updateURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/autoquestcompleter.user.js
// ==/UserScript==

let questTypes = [];
let autoQuestCanBeStopped;
let locationQuestInProgress = false;
let usePokeballQuestInProgress = false;
let useOakMagicBallQuestInProgress = false;
let capturePokemonsQuestInProgress = false;
let capturePokemonTypesQuestInProgress = false;
let regionSelect;
let subRegionSelect;
let routeSelect;
let townSelect;
let dungeonStateSelect;
let gymStateSelect;
let hatcheryCategorySelect;
let hatcheryShinyStatusSelect;
let hatcheryRegionSelect;
let hatcheryType1Select;
let hatcheryType2Select;
let hatcherySortSelect;
let hatcherySortDirectionSelect;
let hatcheryStateSelect;
let autoGym;
let autoDungeon;
let autoHatchery;
let playerHasMoved = false;
let pokeballAlreadyCaughtSelect;
let pokeballChangedForCapturePokemonQuest;
let previousPokeballAlreadyCaughtSelect;

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

    //Avoids that the buttons of other scripts do not exist yet
    setTimeout(function() {
        autoGym = document.getElementById("auto-gym-start");
        autoDungeon = document.getElementById("auto-dungeon-start");
        autoHatchery = document.getElementById("auto-hatch-start");
    }, 1000);


    //Checks for new quests to add to the list and claims completed ones
    var autoQuest = setInterval(function(){
        let questsNeed = 0;
        if (trackRefresh != App.game.quests.lastRefresh) {
            //Reload quest types from local storage to re-enter the dungeon if they are deleted because there are not enough dungeon tokens left.
            questTypes = JSON.parse(localStorage.getItem('autoQuestTypes'));
            trackRefresh = App.game.quests.lastRefresh;
            if (playerHasMoved) {
                playerResetState();
            }
            endUsePokeballQuest();
            resetQuestModify();
        }
        if (localStorage.getItem('autoQuestEnable') == 'true'){
            autoQuestCanBeStopped = true;
            //Attempt to start all available quests & quit the filtered ones
            App.game.quests.questList().forEach(quest => {
                if (quest.inProgress() == true && !questTypes.includes(quest.constructor.name)) {
                    App.game.quests.quitQuest(quest.index);
                    endQuest(quest);
                } else if (quest.isCompleted() == false && quest.inProgress() == false && questTypes.includes(quest.constructor.name)){
                    App.game.quests.beginQuest(quest.index);
                }
            })
            if (App.game.quests.currentQuests().length > 0){
                //Claim all completed quest & check if quests should refresh
                App.game.quests.currentQuests().forEach(quest => {
                    if (quest.notified == true){
                        App.game.quests.claimQuest(quest.index)
                        endQuest(quest);
                    }
                    else {
                        startQuest(quest);
                    }
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
            //Check if location of player has reset
            if (!locationQuestInProgress && playerHasMoved) {
                playerResetState();
            }
        } else if (autoQuestCanBeStopped) {
            autoQuestCanBeStopped = false;
            App.game.quests.questList().forEach(quest => {
                endQuest(quest);
            })
        } else if (playerHasMoved) {
            playerResetState();
        }
    }, 500)

    function resetQuestModify() {
        //Selecting Quest list in Quest Modal and adding click listeners
        const questHTML = document.getElementById('QuestModal').querySelector('tbody').children;
        for (let i = 0; i < questHTML.length; i++) {
            questHTML[i].querySelector('td:nth-child(1)').setAttribute('data-src', i);
            questHTML[i].classList.add("clickable");
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

    function startQuest(quest) {
        if(quest instanceof DefeatGymQuest) {
            completeDefeatGymQuest(quest);
        } else if(quest instanceof DefeatPokemonsQuest) {
            completeDefeatPokemonQuest(quest);
        } else if(quest instanceof DefeatDungeonQuest) {
            completeDefeatDungeonQuest(quest);
        } else if (quest instanceof UsePokeballQuest) {
            completeUsePokeballQuest(quest);
        } else if (quest instanceof CatchShiniesQuest) {
            changePokeballForPokemonQuest();
        } else if (quest instanceof CapturePokemonsQuest) {
            completeCapturePokemonsQuest();
        } else if (quest instanceof CapturePokemonTypesQuest) {
            changePokeballForPokemonQuest();
            completeCapturePokemonTypesQuest(quest);
        } else if (quest instanceof UseOakItemQuest) {
            if (quest.item === OakItemType.Magic_Ball) {
                completeUseOakMagicBallQuest(quest);
            }
        }
    }

    function endQuest(quest) {
        if(quest instanceof DefeatGymQuest) {
            endLocationQuest(quest);
        } else if(quest instanceof DefeatPokemonsQuest) {
            endLocationQuest(quest);
        } else if(quest instanceof DefeatDungeonQuest) {
            endLocationQuest(quest);
        }else if (quest instanceof UsePokeballQuest) {
            endUsePokeballQuest();
        } else if (quest instanceof CapturePokemonsQuest) {
            endCapturePokemonsQuest(quest);
        } else if (quest instanceof CapturePokemonTypesQuest) {
            endCapturePokemonTypesQuest(quest);
        } else if (quest instanceof UseOakItemQuest) {
            if (quest.item === OakItemType.Magic_Ball) {
                endUseOakMagicBallQuest();
            }
        }
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

function removeQuestTemporarily(quest) {
    const indexPos = questTypes.indexOf(quest.constructor.name);
    if (indexPos !== -1) {
        questTypes[indexPos] = null;
    }
}

function stopAutoDungeon() {
    if(autoDungeon && !autoDungeon.classList.contains("btn-danger")) {
        autoDungeon.click();
    }
}

function stopAutoGym() {
    if (autoGym && !autoGym.classList.contains("btn-danger")) {
        autoGym.click();
    }
}

function playerSaveState() {
    //Save last location of player in temp variable
    regionSelect = player.region;
    subRegionSelect = player.subregion;
    routeSelect = player.route();
    townSelect = player.town().name;

    if(autoDungeon && autoDungeon.classList.contains("btn-danger")) {
        dungeonStateSelect = false;
    } else if(autoDungeon && autoDungeon.classList.contains("btn-success")) {
        dungeonStateSelect = true;
    }
    if(autoGym && autoGym.classList.contains("btn-danger")) {
        gymStateSelect = false;
    } else if(autoGym && autoGym.classList.contains("btn-success")) {
        gymStateSelect = true;
    }
}

function playerResetState() {
    if (playerMoveTo(regionSelect, townSelect, routeSelect)) {
        playerHasMoved = false;
    }
    if (autoDungeon) {
        if(dungeonStateSelect && !autoDungeon.classList.contains("btn-success")) {
            autoDungeon.click();
        } else if(!dungeonStateSelect && !autoDungeon.classList.contains("btn-danger")) {
            autoDungeon.click();
        }
    }
    if (autoGym) {
        if(gymStateSelect && !autoGym.classList.contains("btn-success")) {
            autoGym.click();
        } else if(!gymStateSelect && !autoGym.classList.contains("btn-danger")) {
            autoGym.click();
        }
    }
}

function playerSaveHatcheryFilters() {
    hatcheryCategorySelect = BreedingController.filter.category();
    hatcheryShinyStatusSelect = BreedingController.filter.shinyStatus();
    hatcheryRegionSelect = BreedingController.filter.region();
    hatcheryType1Select = BreedingController.filter.type1();
    hatcheryType2Select = BreedingController.filter.type2();
    hatcherySortSelect = Settings.getSetting('hatcherySort').observableValue();
    hatcherySortDirectionSelect = Settings.getSetting('hatcherySortDirection').observableValue();

    if(autoHatchery && autoHatchery.classList.contains("btn-danger")) {
        hatcheryStateSelect = false;
    } else if(autoHatchery && autoHatchery.classList.contains("btn-success")) {
        hatcheryStateSelect = true;
    }
}

function playerResetHatcheryFilters() {
    playerSetHatcheryFilters(hatcheryCategorySelect, hatcheryShinyStatusSelect, hatcheryRegionSelect, hatcheryType1Select, hatcheryType2Select, hatcherySortSelect, hatcherySortDirectionSelect)
    if (autoHatchery) {
        if(hatcheryStateSelect && !autoHatchery.classList.contains("btn-success")) {
            autoHatchery.click();
        } else if(!hatcheryStateSelect && !autoHatchery.classList.contains("btn-danger")) {
            autoHatchery.click();
        }
    }
}

function playerSetHatcheryFilters(category, shinyStatus, region, type1, type2, hatcherySort, hatcherySortDirection) {
    if (BreedingController.filter.category() !== category) {
        BreedingController.filter.category(category);
    }
    if (BreedingController.filter.shinyStatus() !== shinyStatus) {
        BreedingController.filter.shinyStatus(shinyStatus);
    }
    if (BreedingController.filter.region() !== region) {
        BreedingController.filter.region(region);
    }
    if (BreedingController.filter.type1() !== type1) {
        BreedingController.filter.type1(type1);
    }
    if (BreedingController.filter.type2() !== type2) {
        BreedingController.filter.type2(type2);
    }
    if (Settings.getSetting('hatcherySort').observableValue() !== hatcherySort) {
        Settings.getSetting('hatcherySort').observableValue(hatcherySort); // Breeding efficient
    }
    if (Settings.getSetting('hatcherySort').observableValue() !== hatcherySortDirection) {
        Settings.getSetting('hatcherySortDirection').observableValue(hatcherySortDirection);
    }
}

function playerMoveTo(region, town, route) {
    if (playerCanMove()) {
        if (region === 6) {
            player.subregion = getAlolaSubRegionFromLocation(town);
        }
        if (route !== 0) {
            MapHelper.moveToRoute(route, region);
        } else if (town !== null) {
            player.region = region;
            MapHelper.moveToTown(town);
        }
        return true;
    }
    return false;
}

function playerCanMove() {
    return !DungeonRunner.fighting() && !DungeonRunner.fightingBoss()
        && !DungeonBattle.catching() && !GymRunner.running();
}

function playerCanPayDungeonEntrance(dungeonName, progressText) {
    const dungeon = Object.entries(TownList).filter(([key, value]) => key === dungeonName)[0][1].dungeon
    let getTokens = App.game.wallet.currencies[GameConstants.Currency.dungeonToken]();
    let dungeonCost = dungeon.tokenCost;
    let progress = progressText.split('/').map(element => parseInt(element.trim()));
    let amountRemaining = progress[1] - progress[0];
    return getTokens >= dungeonCost * amountRemaining;
}

function playerHasPokeballs(pokeball, progressText = null) {
    let amountRemaining;
    if (progressText) {
        const progress = progressText.split('/').map(element => parseInt(element.trim()));
        amountRemaining = progress[1] - progress[0];
    } else {
        amountRemaining = 1;
    }
    return App.game.pokeballs.pokeballs[pokeball].quantity() >= amountRemaining;
}

function playerSavePokeballAlreadyCaught() {
    if (!usePokeballQuestInProgress && !useOakMagicBallQuestInProgress) {
        pokeballAlreadyCaughtSelect = App.game.pokeballs.alreadyCaughtSelection;
    }
}

function playerSetAlreadyCaughtPokeball(pokeball) {
    if (App.game.pokeballs.alreadyCaughtSelection !== pokeball) {
        App.game.pokeballs._alreadyCaughtSelection(pokeball);
    }
}

function playerBestPokeballAvailable() {
    //Check if player have pokeball to catch pokemon
    let pokeball = -1;
    for (let i = GameConstants.Pokeball.Ultraball; i >= 0; i--) {
        if (playerHasPokeballs(i)) {
            pokeball = i;
            break;
        }
    }
    return pokeball;
}

function changePokeballForPokemonQuest() {
    if (!pokeballChangedForCapturePokemonQuest && App.game.pokeballs.alreadyCaughtSelection >= GameConstants.Pokeball.Ultraball) return;
    if (App.game.gameState !== GameConstants.GameState.fighting) return;
    if (Battle.catching()) return;

    let currentQuests = App.game.quests.currentQuests();
    let capturePokemonTypesQuest = currentQuests.find(e => e instanceof CapturePokemonTypesQuest);
    let catchShiniesQuest = currentQuests.find(e => e instanceof CatchShiniesQuest);

    let forceCapture = false;
    if (capturePokemonTypesQuest !== undefined) {
        if (capturePokemonTypesQuest.type === Battle.enemyPokemon().type1 || capturePokemonTypesQuest.type === Battle.enemyPokemon().type2) {
            forceCapture = true;
        }
    }
    if (catchShiniesQuest !== undefined) {
        if (Battle.enemyPokemon().shiny || DungeonBattle.enemyPokemon().shiny) {
            forceCapture = true;
        }
    }

    if (forceCapture) {
        //Check if player have pokeball to catch pokemon
        let pokeball = playerBestPokeballAvailable();
        if (pokeball === -1) return;
        if (!pokeballChangedForCapturePokemonQuest) {
            previousPokeballAlreadyCaughtSelect = App.game.pokeballs.alreadyCaughtSelection;
            pokeballChangedForCapturePokemonQuest = true;
        }
        playerSetAlreadyCaughtPokeball(pokeball);
    } else if (pokeballChangedForCapturePokemonQuest) {
        playerSetAlreadyCaughtPokeball(previousPokeballAlreadyCaughtSelect);
        pokeballChangedForCapturePokemonQuest = false;
    }
}

function endLocationQuest() {
    //Executed when the quest is completed
    if (locationQuestInProgress) {
        locationQuestInProgress = false;
        stopAutoDungeon();
        stopAutoGym();
        playerResetState();
    }
}

function endUsePokeballQuest() {
    //Executed when the quest is completed
    usePokeballQuestInProgress = false;
    if (pokeballAlreadyCaughtSelect !== undefined) {
        playerSetAlreadyCaughtPokeball(pokeballAlreadyCaughtSelect);
    }
}

function endUseOakMagicBallQuest() {
    //Executed when the quest is completed
    useOakMagicBallQuestInProgress = false;
    if (pokeballAlreadyCaughtSelect !== undefined) {
        playerSetAlreadyCaughtPokeball(pokeballAlreadyCaughtSelect);
    }
}

function endCapturePokemonsQuest() {
    capturePokemonsQuestInProgress = false;
    if (!capturePokemonTypesQuestInProgress) {
        playerResetHatcheryFilters();
    }
}

function endCapturePokemonTypesQuest() {
    capturePokemonTypesQuestInProgress = false;
    if (!capturePokemonsQuestInProgress) {
        playerResetHatcheryFilters();
    } else {
        //Set type1 to all if pokemon quest capture is in progress
        BreedingController.filter.type1(-2);
    }
}

function completeDefeatGymQuest(quest) {
    if(!locationQuestInProgress && !playerHasMoved) {
        playerSaveState();
        stopAutoDungeon();
        stopAutoGym();
        locationQuestInProgress = true;
    }
    //Find town associate to gym
    const gymListAsArray = Object.entries(GymList);
    const town = gymListAsArray.filter(([key, value]) => key === quest.gymTown)[0][1];

    //Move player to quest town
    if (!playerHasMoved && playerMoveTo(town.parent.region, town.parent.name, 0)) {
        playerHasMoved = true;
    }

    //Find gym in town
    if(player.town().name === town.parent.name) {
        for(const gym of player.town().content) {
            if(gym.town === quest.gymTown && App.game.gameState !== GameConstants.GameState.gym) {
                gym.protectedOnclick();
            }
        }
    }
}

function completeDefeatPokemonQuest(quest) {
    if(!locationQuestInProgress && !playerHasMoved) {
        playerSaveState();
        stopAutoDungeon();
        stopAutoGym();
        locationQuestInProgress = true;
    }

    //Move player to quest route
    if (!playerHasMoved && playerMoveTo(quest.region, null, quest.route)) {
        playerHasMoved = true;
    }
}

function completeDefeatDungeonQuest(quest) {
    //Can't farm the dungeons without the autoclicker
    if(!autoDungeon) return;

    //Remove dungeon quest for current cycle if total token needed not available
    if(!playerCanPayDungeonEntrance(quest.dungeon, quest.progressText())) {
        removeQuestTemporarily(quest);
        return;
    }

    if(!locationQuestInProgress && !playerHasMoved) {
        playerSaveState();
        stopAutoDungeon();
        stopAutoGym();
        locationQuestInProgress = true;
    }

    //Move player to quest dungeon
    if (!playerHasMoved && playerMoveTo(quest.region, quest.dungeon, 0)) {
        playerHasMoved = true;
    }

    if(player.town().name === quest.dungeon) {
        if(autoDungeon && !autoDungeon.classList.contains("btn-success")) {
            autoDungeon.click();
        }
    }
}

function completeUsePokeballQuest(quest) {
    if (!usePokeballQuestInProgress && !pokeballChangedForCapturePokemonQuest) {
        playerSavePokeballAlreadyCaught();
        usePokeballQuestInProgress = true;
    }

    if (usePokeballQuestInProgress) {
        //Remove use pokeball quest for current cycle if total pokeball needed not available
        if(!playerHasPokeballs(quest.pokeball, quest.progressText())) {
            removeQuestTemporarily(quest);
            return;
        }
        playerSetAlreadyCaughtPokeball(quest.pokeball);
    }
}

function completeUseOakMagicBallQuest(quest) {
    if (!usePokeballQuestInProgress&& !pokeballChangedForCapturePokemonQuest) {
        playerSavePokeballAlreadyCaught();
        useOakMagicBallQuestInProgress = true;
    }
    if (useOakMagicBallQuestInProgress) {
        //Remove use pokeball quest for current cycle if total pokeball needed not available
        let pokeball = playerBestPokeballAvailable();
        if (pokeball === -1) {
            removeQuestTemporarily(quest);
        }
        playerSetAlreadyCaughtPokeball(pokeball);
    }
}

function completeCapturePokemonsQuest() {
    //Can't use hatchery without autohatchery
    if(!autoHatchery) return;

    if (!capturePokemonsQuestInProgress && !capturePokemonTypesQuestInProgress) {
        if (!capturePokemonTypesQuestInProgress) {
            playerSaveHatcheryFilters();
        }

        capturePokemonsQuestInProgress = true;
        playerSetHatcheryFilters(-1, -2, -2, -2, -2, 6, true);

        if(autoHatchery.classList.contains("btn-danger")) {
            autoHatchery.click();
        }
    }
}

function completeCapturePokemonTypesQuest(captureQuest) {
    //Can't use hatchery without autohatchery
    if(!autoHatchery) return;

    if(!capturePokemonTypesQuestInProgress) {
        if (!capturePokemonsQuestInProgress) {
            playerSaveHatcheryFilters();
        }
        playerSetHatcheryFilters(-1, -2, -2, captureQuest.type, -2, 6, true)
        capturePokemonTypesQuestInProgress = true;
        if(autoHatchery.classList.contains("btn-danger")) {
            autoHatchery.click();
        }
    }
}

function getAlolaSubRegionFromLocation(locationName) {
    //TODO: Find a solution to retrieve locations by sub-region in a programmatic way
    //On Alola map subregion not available on Town, Route or Dungeon
    //Location found from https://github.com/pokeclicker/pokeclicker/blob/ff8b53478cf714c61de8b33d73cd1275ce785688/src/components/AlolaSVG.html
    const alolaSubregion0 = ["Route 1", "Route 1 Hau'oli Outskirts", "Route 2", "Route 3", "Melemele Sea", "Kala'e Bay", "Iki Town Outskirts", "Iki Town", "Professor Kukui\'s Lab", "Hau'oli City", "Melemele Woods", "Roadside Motel", "Trainers School", "Hau'oli Cemetery", "Seaward Cave", "Ten Carat Hill"];
    const alolaSubregion1 = ["Route 4", "Route 5", "Route 6", "Route 7", "Route 8", "Route 9", "Akala Outskirts", "Heahea City", "Paniola Town", "Royal Avenue", "Konikoni City", "Aether Paradise", "Roadside Motel", "Pikachu Valley", "Paniola Ranch", "Brooklet Hill", "Wela Volcano Park", "Lush Jungle", "Diglett's Tunnel", "Memorial Hill", "Aether Foundation", "Ruins of Life"];
    const alolaSubregion2 = ["Route 10", "Mount Hokulani", "Route 11", "Route 12", "Route 13", "Haina Desert", "Route 14", "Route 15", "Route 16", "Route 17", "Poni Wilds", "Ancient Poni Path", "Poni Breaker Coast", "Poni Grove", "Poni Plains", "Poni Coast", "Poni Gauntlet", "Aether Paradise", "Malie City", "Tapu Village", "Seafolk Village", "Exeggutor Island", "Altar of the Sunne and Moone", "Pokémon League Alola", "Vast Poni Canyon", "Lake of the Sunne and Moone"];

    if(alolaSubregion0.includes(locationName)) {
        return 0;
    } else if(alolaSubregion1.includes(locationName)) {
        return 1;
    } else if(alolaSubregion2.includes(locationName)) {
        return 2;
    }
    return 0;
}