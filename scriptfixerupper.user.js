// ==UserScript==
// @name          [Pokeclicker] Script Fixer Upper
// @namespace     Pokeclicker Scripts
// @author        Ephenia
// @description   A script solely for clearing out localStorage without saves being affected. Meant to be a user friendly solution for this and or for users who aren't as tech literate.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.4

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
        for (let i = 0; i < localStorage.length; i++){
            const key = localStorage.key(i);
            if (!key.includes('save') && !key.includes('player') && !key.includes('settings')) {
                setTimeout(() => {
                    localStorage.removeItem(key);
                }, 25)
            }
            setTimeout(() => {
                location.reload();
            }, (localStorage.length * 25) + 25)
        }
    }
    const isDesktop = App.isUsingClient;
    if (!isDesktop) {
        const warning = "Attempt to fix and reset script settings? This should clear out localStorage in relation to scripts and their dependencies, but should NOT affect any of your save data. You should back up your saves before doing so, just to be safe. Press OK to proceed!\r\n\r\nNote: This process may take a few seconds to complete and the page should reload when complete.";
        if (confirm(warning) == true) {
            clearLocalStorage();
        }
    } else {
        const warning = "At the moment, scriptfixerupper does not support the desktop client. Sorry! You can still load your save in the web version and run this script there.";
        confirm(warning);
        //we'll add logic for Desktop client here later for how we want to handle it
    }
}

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        setTimeout(() => {
            initFixerUpper()
        }, 3000)
        return result
    }
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
