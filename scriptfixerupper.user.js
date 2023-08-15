// ==UserScript==
// @name          [Pokeclicker] Script Fixer Upper
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   A script solely for clearing out localStorage without saves being affected. Meant to be a user friendly solution for this and or for users who aren't as tech literate.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       2.0

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

function initFixerUpper() {
    function clearLocalStorage() {
        for (let i = localStorage.length - 1; i >= 0; i--){
            const key = localStorage.key(i);
            if (!key.startsWith('save') && !key.startsWith('player') && !key.startsWith('settings')) {
                localStorage.removeItem(key);
            }
        }
        setTimeout(() => { location.reload(); }, 1000);
    }
    const warning = "Attempt to fix and reset script settings? This should clear out localStorage in relation to scripts and their dependencies, but should NOT affect any of your save data. You should back up your saves before doing so, just to be safe. Press OK to proceed!\r\n\r\nNote: This process may take a few seconds to complete and the page should reload when complete.";
    if (confirm(warning) == true) {
        clearLocalStorage();
    }
}

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        setTimeout(() => {
            initFixerUpper()
        }, 5000);
        return result
    }
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
