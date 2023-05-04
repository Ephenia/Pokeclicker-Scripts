// ==UserScript==
// @name          [Pokeclicker] Overnight Berries
// @namespace     Pokeclicker Scripts
// @author        Optimatum (Credit: Ephenia)
// @description   Allows berres to grow while the game is closed.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/overnightberrygrowth.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/overnightberrygrowth.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = "overnightberrygrowth";
const stageMargin = 2; // buffer in seconds around stage changes
var overnightGrowthMode;

// handle settings

function initSettings() {
    // Add settings to settings menu
    var settingsHeader = document.createElement("tr");
    settingsHeader.innerHTML = '<th colspan="2">Overnight Berries settings</th>';
    document.getElementById('settingsModal').querySelector('tr[data-bind*="showMuteButton"]').after(settingsHeader);

    var settingsElems = [];
    settingsElems.push(document.createElement('tr'));
    settingsElems.at(-1).innerHTML = `<td class="p-2">
        Game closed berry growth mode
        </td>
        <td class="p-0">
        <select id="select-overnightGrowthMode" class="form-control">
        <option value="0">Until ripe</option>
        <option value="1">Until withered</option>
        <option value="2">Harvest before withering</option>
        </select>
        </td>`;
    settingsHeader.after(...settingsElems);

    document.getElementById('select-overnightGrowthMode').value = overnightGrowthMode;
    document.getElementById('select-overnightGrowthMode').addEventListener('change', (event) => { changeGrowthMode(event); } );;
}

function changeGrowthMode(event) {
    const val = +event.target.value;
    overnightGrowthMode = val;
    localStorage.setItem("overnightGrowthMode", overnightGrowthMode);
}

// trigger growth when enough of the game has loaded

const gameInitOld = Game.prototype.initialize;
Game.prototype.initialize = function () {
    var returnVal = gameInitOld.apply(this, arguments);
    var elapsedTime = Math.floor((Date.now() - player._lastSeen) / 1000);
    growOffline(elapsedTime);
    return returnVal;
}

// growth functions

class trackPlot {
    constructor(plot) {
        this.plot = plot;
    }
    calcUpdateTime() {
        // adapted from Plot.calcFormattedStageTimeLeft
        const growthTime = this.plot.berryData.growthTime.find(t => this.plot.age < t);
        const timeLeft = growthTime - this.plot.age;
        const growthMultiplier = App.game.farming.getGrowthMultiplier() * this.plot.getGrowthMultiplier();
        this.timeLeft = Math.ceil(timeLeft / growthMultiplier);
        this.isRipe = (this.plot.stage() === PlotStage.Berry);
    }
}

function growOffline(timeToGrow) {
    var plotList = [];
    for (const plot of App.game.farming.plotList) {
        if (plot.berry != undefined && plot.berry != BerryType.None) {
            // account for berries already ripe in until-ripe mode
            if (!(overnightGrowthMode == 0 && plot.stage() == PlotStage.Berry)) {
                plotList.push(new trackPlot(plot));
            }
        }
    }
    while (timeToGrow > 0 && plotList.length > 0) {
        for (const tracker of plotList) {
            tracker.calcUpdateTime();
        }
        plotList.sort((a, b) => (b.timeLeft - a.timeLeft)); // sort in descending order
        var growthTimeThisLoop = Math.min(plotList.at(-1).timeLeft, timeToGrow);
        // grow until stage changes that could affect growth times
        for (const tracker of plotList) {
            tracker.plot.update(growthTimeThisLoop - stageMargin);
        }
        // add last second(s)
        for (var i = 0; i < plotList.length; i++) {
            const tracker = plotList[i];
            if (tracker.timeLeft == growthTimeThisLoop) {
                tracker.calcUpdateTime()
            }
            if (tracker.timeLeft <= stageMargin) {
                var toRemove = changeStage(tracker.plot);
                if (toRemove) {
                    plotList.splice(i, 1);
                    i--;
                }
            } else {
                tracker.plot.update(stageMargin);
            }
        }
        timeToGrow -= growthTimeThisLoop;
    }
}

function changeStage(plot) {
    var stage = plot.stage();
    // until ripe
    if (overnightGrowthMode == 0) {
        if (stage === PlotStage.Bloom) {
            plot.update(stageMargin);
            return true;
        }
        // just-in-case check
        else if (stage === PlotStage.Berry) {
            return true;
        }
    }
    // until withered
    else if (overnightGrowthMode == 1) {
        if (stage === PlotStage.Berry) {
            plot.update(stageMargin);
            return true;
        }
    }
    // harvest before wither
    else if (overnightGrowthMode == 2) {
        if (stage === PlotStage.Berry) {
            var i = App.game.farming.plotList.indexOf(plot);
            App.game.farming.harvest(i);
            return true;
        }
    }
    // just-in-case check
    else if (stage === PlotStage.Berry) {
        plot.update(stageMargin);
        return true;
    }
    plot.update(stageMargin);
    return false;
}

// load settings from storage

function validateStorage(key, type) {
    try { 
        var val = localStorage.getItem(key);
        if (val === null) {
            throw new Error();
        }
        val = JSON.parse(val);
        if (typeof val !== type) {
            throw new Error();
        }
        return val;
    } catch (e) {
        return null;
    }
}


overnightGrowthMode = validateStorage('overnightGrowthMode', 'number') ?? 0;
if (![0, 1, 2].includes(overnightGrowthMode)) {
    overnightGrowthMode = 0;
}

// load script

function loadScript() {
    const oldInit = Preload.hideSplashScreen;

    Preload.hideSplashScreen = function () {
        var result = oldInit.apply(this, arguments);
        initSettings();
        return result;
    }
}

if (document.getElementById('scriptHandler') != undefined) {
    var scriptElement = document.createElement('div');
    scriptElement.id = scriptName;
    document.getElementById('scriptHandler').appendChild(scriptElement);
    if (localStorage.getItem(scriptName) != null) {
        if (localStorage.getItem(scriptName) == 'true') {
            loadScript();
        }
    }
    else {
        localStorage.setItem(scriptName, 'true')
        loadScript();
    }
}
else {
    loadScript();
}
