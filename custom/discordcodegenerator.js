// ==UserScript==
// @name        [Pokeclicker] Discord Code Generator
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.2
// @author      Ephenia (Original/Credit: G1)
// @description Lets you generate infinite amounts of Discord codes for Pokémon that are exclusive and locked behind Pokeclicker's Discord bot & activities. No linking of a Discord account required + fully works offline.
// ==/UserScript==

var resCodes;
var validPoke = [];

function initCodeGen() {
    genCodes();
    var saveTab = document.getElementById('saveTab');
    var fragment = new DocumentFragment();
    for (let i = 0; i < validPoke.length; i++) {
        var codeHTML = document.createElement("div");
        codeHTML.innerHTML = `<button id="disc-${i}" class="btn btn-primary btn-block">${validPoke[i] + ` - ` + resCodes[i]}</button>`
        if (i == validPoke.length - 1) {
            codeHTML.innerHTML += `<hr>`
        }
        fragment.appendChild(codeHTML)
    }
    saveTab.prepend(fragment)
    for (let ii = 0; ii < validPoke.length; ii++) {
       document.getElementById('disc-'+ii).addEventListener('click', submitCode, false);
    }
}

function submitCode() {
    var codeInput = document.getElementById('redeemable-code-input');
    codeInput.value = resCodes[+event.target.id.replace(/disc-/g, "")];
    RedeemableCodeController.enterCode();
    genCodes();
    resetHTML();
}

function resetHTML() {
    for (let i = 0; i < validPoke.length; i++) {
        document.getElementById(`disc-` + i).innerHTML = validPoke[i] + ` - ` + resCodes[i];
    }
}

function genCodes() {
    resCodes = [];
    App.game.discord.codes.forEach(e => e.claimed = false);
    var discordID = randInt();
    App.game.discord.ID(discordID);
    for (codeString of validPoke) {
        let codeSeed = codeString.split('').reverse().map(l => l.charCodeAt(0)).reduce((s, b) => s * (b / 10), 1);
        SeededRand.seed(discordID + codeSeed);
        const arr = [];
        for (let i = 0; i < 14; i++) {
            let int;
            while (int == undefined || int.length != 1) {
                int = SeededRand.intBetween(0, 35).toString(36);
            }
            arr.push(int);
        }

        arr[4] = '-';
        arr[9] = '-';
        resCodes.push(arr.join('').toUpperCase());
    }
}

function randInt() {
    return Math.floor((Math.random() * 65536) + 1);
}

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initCodeGen()
        return result
    }
}

var scriptName = 'discordcodegenerator'

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