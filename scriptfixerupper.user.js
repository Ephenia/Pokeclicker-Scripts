// ==UserScript==
// @name          [Pokeclicker] Script Fixer Upper
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   A script solely for clearing out localStorage without saves being affected. Meant to be a user friendly solution for this and or for users who aren't as tech literate.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       2.1

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/scriptfixerupper.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/scriptfixerupper.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'scriptfixerupper';

function initFixerUpper(resolve) {
    function clearLocalStorage() {
        setTimeout(() => {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (!key.startsWith('save') && !key.startsWith('player') && !key.startsWith('settings')) {
                    localStorage.removeItem(key);
                }
            }
            localStorage.setItem('scriptfixerupper', false);
            location.reload(); 
        }, 1000);
    }
    const warning = "Script Fixer Upper:\n\nAttempt to fix and reset script settings? This should clear out localStorage in relation to scripts and their dependencies, but should NOT affect any of your save data. You should back up your saves before doing so, just to be safe. Press OK to proceed!\n\nNote: This process may take a few seconds to complete and the page should reload when complete.";
    if (confirm(warning)) {
        clearLocalStorage();
    } else {
        resolve();
    }
}

function loadScript() {
    var externalResolve;
    const fixerUpperDone = new Promise((resolve, reject) => {
        externalResolve = resolve;
    });
    const loadApp = Preload.load.bind(Preload);
    Preload.load = function load(...args) {
        return fixerUpperDone.finally(() => loadApp(...args));
    }
    setTimeout(() => {
        initFixerUpper(externalResolve);
    }, 1000);
}

if (!App.isUsingClient && localStorage.getItem(scriptName) === 'false') {
    // Special in-browser behavior after resets 
    localStorage.removeItem(scriptName);
} else if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
