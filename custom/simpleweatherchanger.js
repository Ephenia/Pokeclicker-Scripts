// ==UserScript==
// @name        [Pokeclicker] Simple Weather Changer
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.0
// @author      KarmaAlex
// @description Adds a button to select the weather for the current region, also freezes all weather
// ==/UserScript==

function initWeatherChange(){
    //Freeze weather
    Weather.generateWeather = function(){ return true }
    //Make button
    var weatherBtn = document.createElement('button')
    weatherBtn.textContent = 'Change'
    weatherBtn.className = 'btn btn-block btn-success'
    weatherBtn.style = 'position: absolute; right: 133px; top: 0px; width: auto; height: 41px; font-size: 11px; margin: 0px;'
    weatherBtn.id = 'change-weather'
    document.getElementById('townMap').appendChild(weatherBtn)
    document.getElementById('change-weather').addEventListener('click', changeWeather, false)
    //Make selectbox
    var weatherSelect = document.createElement('select')
    weatherSelect.innerHTML =
    `<option value="0">Clear</option>
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
    weatherSelect.style = 'position: absolute; right: 50px; top: 10px; width: auto; height: 20px; font-size: 9px;'
    document.getElementById('townMap').appendChild(weatherSelect)
    //Set weather to last weather option, is broken with new loading
    if (localStorage.getItem('scriptWeather') != null) Weather.regionalWeather[player.region](parseInt(localStorage.getItem('scriptWeather')))
}

function changeWeather(){
    localStorage.setItem('scriptWeather', document.getElementById('weather-select').value)
    Weather.regionalWeather[player.region](parseInt(localStorage.getItem('scriptWeather')))
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