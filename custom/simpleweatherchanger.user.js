// ==UserScript==
// @name          [Pokeclicker] Simple Weather Changer
// @namespace     Pokeclicker Scripts
// @author        KarmaAlex (Credit: Ephenia, Optimatum)
// @description   Adds a button to select the weather for the current region, also freezes all weather
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.4.1

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/simpleweatherchanger.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/simpleweatherchanger.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var weatherChangerWeather;

function initWeatherChange() {
    // Load selected weather
    weatherChangerWeather = parseInt(localStorage.getItem('weatherChangerWeather'));
    if (isNaN(weatherChangerWeather)) {
        weatherChangerWeather = -1;
    }

    // Make selectbox
    const weatherSelect = document.createElement('select');
    weatherSelect.innerHTML = '<option value="-1">Default Weather</option>\n' + GameHelper.enumSelectOption(WeatherType).map((w) => `<option value="${w.value}">${w.name}</option>`).join('\n');
    weatherSelect.id = 'change-weather-select';
    weatherSelect.value = weatherChangerWeather;
    document.querySelector('#townMap button[data-bind*="DayCycle.color"').before(weatherSelect);

    document.getElementById('change-weather-select').addEventListener('change', (event) => { changeWeather(event); });
    addGlobalStyle('#change-weather-select { position: absolute; right: 100px; top: 10px; width: auto; height: 20px; font-size: 9px; }');

    overrideGenerateWeather();
    Weather.generateWeather(new Date());
}

function changeWeather(event) {
    weatherChangerWeather = +event.target.value;
    Weather.generateWeather(new Date());
    localStorage.setItem('weatherChangerWeather', weatherChangerWeather);
}

function overrideGenerateWeather() {
    const oldGenerateWeather = Weather.generateWeather;
    Weather.generateWeather = function(...args) {
        if (weatherChangerWeather >= 0) {
            Weather.regionalWeather.forEach((weather) => weather(weatherChangerWeather));
        } else {
            return oldGenerateWeather.apply(this, args);
        }
    }
}

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
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

if (!App.isUsingClient || localStorage.getItem('simpleweatherchanger') === 'true') {
    loadEpheniaScript('simpleweatherchanger', initWeatherChange);
}
