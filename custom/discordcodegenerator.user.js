// ==UserScript==
// @name          [Pokeclicker] Discord Code Generator
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Original/Credit: G1)
// @description   Lets you generate infinite amounts of Discord codes for Pokémon that are exclusive and locked behind Pokeclicker's Discord bot & activities. No linking of a Discord account required + fully works offline.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.3.1

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/discordcodegenerator.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/discordcodegenerator.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var resCodes;
var validPoke = [];

function initCodeGen() {
    App.game.discord.codes.forEach(e => validPoke.push(e.name));
    genCodes();
    const saveTab = document.getElementById('saveTab');
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
    const codeInput = document.getElementById('redeemable-code-input');
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
    var discordID = Math.floor((Math.random() * 65536) + 1);
    App.game.discord.ID(discordID);
    for (const codeString of validPoke) {
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

function loadEpheniaScript(scriptName, initFunction) {
    const windowObject = !App.isUsingClient ? unsafeWindow : window;
    // Inject handlers if they don't exist yet
    if (windowObject.epheniaScriptInitializers === undefined) {
        windowObject.epheniaScriptInitializers = {};
        const oldInit = Preload.hideSplashScreen;
        var hasInitialized = false;

        // Initializes scripts once enough of the game has loaded
        Preload.hideSplashScreen = function (...args) {
            var result = oldInit.apply(this, args);
            if (App.game && !hasInitialized) {
                // Initialize all attached userscripts
                Object.entries(windowObject.epheniaScriptInitializers).forEach(([scriptName, initFunction]) => {
                    try {
                        initFunction();
                    } catch (e) {
                        console.error(`Error while initializing '${scriptName}' userscript:\n${e}`);
                        Notifier.notify({
                            type: NotificationConstants.NotificationOption.warning,
                            title: scriptName,
                            message: `The '${scriptName}' userscript crashed while loading. Check for updates or disable the script, then restart the game.\n\nReport script issues to the script developer, not to the Pokéclicker team.`,
                            timeout: GameConstants.DAY,
                        });
                    }
                });
                hasInitialized = true;
            }
            return result;
        }
    }

    // Prevent issues with duplicate script names
    if (windowObject.epheniaScriptInitializers[scriptName] !== undefined) {
        console.warn(`Duplicate '${scriptName}' userscripts found!`);
        Notifier.notify({
            type: NotificationConstants.NotificationOption.warning,
            title: scriptName,
            message: `Duplicate '${scriptName}' userscripts detected. This could cause unpredictable behavior and is not recommended.`,
            timeout: GameConstants.DAY,
        });
        let number = 2;
        while (windowObject.epheniaScriptInitializers[`${scriptName} ${number}`] !== undefined) {
            number++;
        }
        scriptName = `${scriptName} ${number}`;
    }
    // Add initializer for this particular script
    windowObject.epheniaScriptInitializers[scriptName] = initFunction;
}

if (!App.isUsingClient || localStorage.getItem('discordcodegenerator') === 'true') {
    loadEpheniaScript('discordcodegenerator', initCodeGen);
}
