// ==UserScript==
// @name          [Pokeclicker] Overnight Berries
// @namespace     Pokeclicker Scripts
// @author        Optimatum (Credit: Ephenia)
// @description   Allows berres to grow while the game is closed.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       1.1.4

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/overnightberrygrowth.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/overnightberrygrowth.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

const stageMargin = 2; // buffer in seconds around stage changes
var overnightGrowthMode;

// handle settings

function initOvernightBerrySettings() {
    // Add overnightberrygrowth settings
    const settingsBody = createScriptSettingsContainer('Overnight Berry Growth');
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
    document.getElementById('select-overnightGrowthMode').addEventListener('change', (event) => { changeGrowthMode(event); } );
}

function changeGrowthMode(event) {
    const val = +event.target.value;
    overnightGrowthMode = val;
    localStorage.setItem("overnightGrowthMode", overnightGrowthMode);
}

// trigger growth when enough of the game has loaded
function initOfflineGrowth() {
    const gameInitOld = Game.prototype.initialize;
    Game.prototype.initialize = function () {
        var returnVal = gameInitOld.apply(this, arguments);
        var elapsedTime = Math.floor((Date.now() - player._lastSeen) / 1000);
        growOffline(elapsedTime);
        return returnVal;
    }
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

/**
 * Creates container for scripts settings in the settings menu, adding scripts tab if it doesn't exist yet
 */
function createScriptSettingsContainer(name) {
    const settingsID = name.replaceAll(/s/g, '').toLowerCase();
    var settingsContainer = document.getElementById('settings-scripts-container');

    // Create scripts settings tab if it doesn't exist yet
    if (!settingsContainer) {
        // Fixes the Scripts nav item getting wrapped to the bottom by increasing the max width of the window
        document.querySelector('#settingsModal div').style.maxWidth = '850px';
        // Create and attach script settings tab link
        const settingTabs = document.querySelector('#settingsModal ul.nav-tabs');
        const li = document.createElement('li');
        li.classList.add('nav-item');
        li.innerHTML = `<a class="nav-link" href="#settings-scripts" data-toggle="tab">Scripts</a>`;
        settingTabs.appendChild(li);
        // Create and attach script settings tab contents
        const tabContent = document.querySelector('#settingsModal .tab-content');
        scriptSettings = document.createElement('div');
        scriptSettings.classList.add('tab-pane');
        scriptSettings.setAttribute('id', 'settings-scripts');
        tabContent.appendChild(scriptSettings);
        settingsContainer = document.createElement('div');
        settingsContainer.setAttribute('id', 'settings-scripts-container');
        scriptSettings.appendChild(settingsContainer);
    }

    // Create settings container
    const settingsTable = document.createElement('table');
    settingsTable.classList.add('table', 'table-striped', 'table-hover', 'm-0');
    const header = document.createElement('thead');
    header.innerHTML = `<tr><th colspan="2">${name}</th></tr>`;
    settingsTable.appendChild(header);
    const settingsBody = document.createElement('tbody');
    settingsBody.setAttribute('id', `settings-scripts-${settingsID}`);
    settingsTable.appendChild(settingsBody);

    // Insert settings container in alphabetical order
    let settingsList = Array.from(settingsContainer.children);
    let insertBefore = settingsList.find(elem => elem.querySelector('tbody').id > `settings-scripts-${settingsID}`);
    if (insertBefore) {
        insertBefore.before(settingsTable);
    } else {
        settingsContainer.appendChild(settingsTable);
    }

    return settingsBody;
}

// load script

function loadEpheniaScript(scriptName, initFunction, priorityFunction) {
    function reportScriptError(scriptName, error) {
        console.error(`Error while initializing '${scriptName}' userscript:\n${error}`);
        Notifier.notify({
            type: NotificationConstants.NotificationOption.warning,
            title: scriptName,
            message: `The '${scriptName}' userscript crashed while loading. Check for updates or disable the script, then restart the game.\n\nReport script issues to the script developer, not to the Pokéclicker team.`,
            timeout: GameConstants.DAY,
        });
    }
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
                        reportScriptError(scriptName, e);
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
    // Run any functions that need to execute before the game starts
    if (priorityFunction) {
        $(document).ready(() => {
            try {
                priorityFunction();
            } catch (e) {
                reportScriptError(scriptName, e);
                // Remove main initialization function  
                windowObject.epheniaScriptInitializers[scriptName] = () => null;
            }
        });
    }
}

if (!App.isUsingClient || localStorage.getItem('overnightberrygrowth') === 'true') {
    loadEpheniaScript('overnightberrygrowth', initOvernightBerrySettings, initOfflineGrowth);
}