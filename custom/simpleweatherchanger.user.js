// ==UserScript==
// @name          [Pokeclicker] Simple Weather Changer
// @namespace     Pokeclicker Scripts
// @author        KarmaAlex (Credit: Ephenia)
// @description   Adds a button to select the weather for the current region, also freezes all weather
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.3

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/simpleweatherchanger.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/simpleweatherchanger.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var weatherFunc;

function initWeatherChange(){
    weatherFunc = Weather.generateWeather;
    //Make button
    const weatherBtn = document.createElement('button');
    weatherBtn.textContent = 'Change';
    weatherBtn.className = 'btn btn-block btn-success';
    weatherBtn.id = 'change-weather';
    document.getElementById('townMap').appendChild(weatherBtn);
    document.getElementById('change-weather').addEventListener('click', changeWeather, false);
    //Make selectbox
    const weatherSelect = document.createElement('select');
    weatherSelect.innerHTML =
    `<option value="-1">Default</option>
    <option value="0">Clear</option>
    <option value="1">Overcast</option>
    <option value="2">Rain</option>
    <option value="3">Thunderstorm</option>
    <option value="4">Snow</option>
    <option value="5">Hail</option>
    <option value="6">Blizzard</option>
    <option value="7">Sunny</option>
    <option value="8">Sandstorm</option>
    <option value="9">Fog</option>
    <option value="10">Windy</option>`
    weatherSelect.id = 'weather-select'
    document.getElementById('townMap').appendChild(weatherSelect);

    addGlobalStyle('#change-weather { position: absolute; right: 133px; top: 0px; width: auto; height: 41px; font-size: 11px; margin: 0px; }');
    addGlobalStyle('#weather-select { position: absolute; right: 50px; top: 10px; width: auto; height: 20px; font-size: 9px; }');
    //Set weather to last weather option, is broken with new loading
    if (!isNaN(parseInt(localStorage.getItem('scriptWeather')))) {
        const getWeather = parseInt(localStorage.getItem('scriptWeather'));
        document.getElementById('weather-select').value = getWeather;
        Weather.regionalWeather.forEach((Weather) => { Weather(getWeather); });
    }
}

function changeWeather(){
    const selWeather = +document.getElementById('weather-select').value;
    if (selWeather !== -1) {
        //Freeze weather
        Weather.generateWeather = function(){ return true };
        //Set Weather
        Weather.regionalWeather.forEach((Weather) => { Weather(selWeather); });
    } else {
        //Unfreeze weather
        Weather.generateWeather = weatherFunc;
        //Default Weather
        const now = new Date();
        Weather.generateWeather(now);
    }
    localStorage.setItem('scriptWeather', selWeather >= 0 ? selWeather : false);
}

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initWeatherChange()
        return result
    }
}

var scriptName = 'simpleweatherchanger'

if (document.getElementById('scriptHandler') !== undefined){
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) !== null){
        if (localStorage.getItem(scriptName) === 'true'){
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

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}
