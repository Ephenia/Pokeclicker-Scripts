// ==UserScript==
// @name          [Pokeclicker] Overnight Berries
// @namespace     Pokeclicker Scripts
// @author        Optimatum (Credit: Ephenia)
// @description   Allows berres to grow while the game is closed.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.1.1

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
    var scriptSettings = document.getElementById('settings-scripts');
    // Create scripts settings tab if it doesn't exist yet
    if (!scriptSettings) {
        // Fixes the Scripts nav item getting wrapped to the bottom by increasing the max width of the window
        document.getElementById('settingsModal').querySelector('div').style.maxWidth = '850px';
        // Create and attach script settings tab link
        const settingTabs = document.querySelector('#settingsModal ul.nav-tabs');
        let li = document.createElement('li');
        li.classList.add('nav-item');
        li.innerHTML = `<a class="nav-link" href="#settings-scripts" data-toggle="tab">Scripts</a>`;
        settingTabs.appendChild(li);
        // Create and attach script settings tab contents
        const tabContent = document.querySelector('#settingsModal .tab-content');
        scriptSettings = document.createElement('div');
        scriptSettings.classList.add('tab-pane');
        scriptSettings.setAttribute('id', 'settings-scripts');
        tabContent.appendChild(scriptSettings);
    }

    // Add overnightberrygrowth settings
    let table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-hover', 'm-0');
    scriptSettings.prepend(table);
    let header = document.createElement('thead');
    header.innerHTML = '<tr><th colspan="2">Overnight Berry Growth</th></tr>';
    table.appendChild(header);
    let settingsBody = document.createElement('tbody');
    settingsBody.setAttribute('id', 'settings-scripts-overnightberrygrowth');
    table.appendChild(settingsBody);
    let settingsElem = document.createElement('tr');
    settingsElem.innerHTML = `<td class="p-2 col-md-8">
        Offline berry growth mode
        </td>
        <td class="p-0 col-md-4">
        <select id="select-overnightGrowthMode" class="form-control">
        <option value="0">Until ripe</option>
        <option value="1">Until withered</option>
        <option value="2">Harvest before withering</option>
        </select>
        </td>`;
    settingsBody.appendChild(settingsElem);

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
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args);
        if (App.game && !hasInitialized) {
            initSettings();
            hasInitialized = true;
        }
        return result;
    }
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
