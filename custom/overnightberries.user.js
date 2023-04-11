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
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/overnightberries.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/overnightberries.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==


const scriptName = "overnightberries";
var overnightGrowthMode;
const stageMargin = 2; // buffer in seconds around stage changes


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

class trackPlot {
    constructor(plot) {
        this.plot = plot;
    }
    calcUpdateTime() {
        // adapted from Plot.calcFormattedStageTimeLeft
        const growthTime = this.plot.berryData.growthTime.find(t => this.plot.age < t);
        const timeLeft = Math.ceil(growthTime - this.plot.age);
        const growthMultiplier = App.game.farming.getGrowthMultiplier() * this.plot.getGrowthMultiplier();
        this.timeToNextStage = Math.ceil(timeLeft / growthMultiplier);
    }
}

function growOffline(timeToGrow) {
    var plotList = [];
    // build berry list
    for (const plot of App.game.farming.plotList) {
        if (plot.berry != undefined && plot.berry != BerryType.None) {
            // account for berries already ripe in until-ripe mode
            if (!(overnightGrowthMode == 0 && plot.stage() == PlotStage.Berry)) {
                plotList.push(new trackPlot(plot));
            }
        }
    }
    // repeatedly add just enough time for one berry to change stage
    // (adding all at once risks unpredictable growth with auras)
    while (timeToGrow > 0 && plotList.length > 0) {
        for (const tracker of plotList) {
            tracker.calcUpdateTime();
        }
        // sort in descending order
        plotList.sort((a, b) => (b.timeToNextStage - a.timeToNextStage));
        var growthTimeThisLoop = Math.min(plotList.at(-1).timeToNextStage, timeToGrow);
        // grow until right before a stage change to avoid auras changing
        for (const tracker of plotList) {
            tracker.plot.update(Math.max(growthTimeThisLoop - stageMargin, 0));
        }
        // add last second(s) for stage change
        for (var i = 0; i < plotList.length; i++) {
            const tracker = plotList[i];
            if (tracker.timeToNextStage == growthTimeThisLoop) {
                tracker.calcUpdateTime()
            }
            if (tracker.timeToNextStage <= stageMargin) {
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


const computeOfflineOld = Game.prototype.computeOfflineEarnings;
Game.prototype.computeOfflineEarnings = function () {
    var elapsedTime = Math.floor((Date.now() - player._lastSeen) / 1000);
    var returnVal = computeOfflineOld.apply(this, arguments);
    growOffline(elapsedTime);
    return returnVal;
}


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
