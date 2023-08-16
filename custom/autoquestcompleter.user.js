// ==UserScript==
// @name          [Pokeclicker] Auto Quest Completer
// @namespace     Pokeclicker Scripts
// @author        Optimatum (Credit: KarmaAlex, Ephenia)
// @description   Removes the limit for the number of quests you can do at once and auto completes/starts new ones.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       2.0

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/autoquestcompleter.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/custom/autoquestcompleter.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'autoquestcompleter';

function initAutoQuest() {
    /* Load settings */
    const questSubscriptions = [];
    var autoQuestEnabled = loadSetting('autoQuestEnabled', false);
    var maxQuests = loadSetting('autoQuestMaxQuests', 10);
    if (!(Number.isInteger(maxQuests) && 0 < maxQuests && maxQuests <= 10)) {
        maxQuests = 10;
    }
    var ignoredQuestTypes = loadSetting('autoQuestIgnoredQuestTypes', []);
    ignoredQuestTypes = ignoredQuestTypes.filter((type) => Object.keys(QuestHelper.quests).includes(type));
    var questResetTimer = loadSetting('autoQuestResetTimer', 10);
    if (!(Number.isInteger(questResetTimer) && questResetTimer > 0)) {
        questResetTimer = 10;
    }
    var questResetState = loadSetting('autoQuestResetState', false);
    var questResetTimeout;

    createSettings();

    /* Initialize quest handling */

    overrideMethods();
    if (autoQuestEnabled) {
        refreshQuestSubscriptions();
    }

    /* Functions */

    function createSettings() {
        // Toggle buttons
        const autoQuestBtn = document.createElement('button');
        autoQuestBtn.id = 'toggle-auto-quest';
        autoQuestBtn.className = `btn btn-block btn-${autoQuestEnabled ? 'success' : 'danger'}`;
        autoQuestBtn.style = 'position: absolute; left: 0px; top: 0px; width: auto; height: 41px; font-size: 9px;';
        autoQuestBtn.textContent = `Auto [${autoQuestEnabled ? 'ON' : 'OFF'}]`;
        autoQuestBtn.addEventListener('click', () => { toggleAutoQuest(); })
        document.getElementById('questDisplayContainer').appendChild(autoQuestBtn);

        const questResetBtn = document.createElement('button');
        questResetBtn.id = 'toggle-auto-quest-reset';
        questResetBtn.className = `btn btn-block btn-${questResetState ? 'success' : 'danger'}`;
        questResetBtn.style = 'width: auto; height: 41px; font-size: 12px;';
        questResetBtn.textContent = `${questResetTimer} minute Reset Timer [${questResetState ? 'ON' : 'OFF'}]`;
        questResetBtn.addEventListener('click', () => { toggleQuestResetState(); });
        document.getElementById('questDisplayContainer').appendChild(questResetBtn);
        
        // Settings tab options
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

        // Add settings to scripts tab
        let table = document.createElement('table');
        table.classList.add('table', 'table-striped', 'table-hover', 'm-0');
        scriptSettings.prepend(table);
        let header = document.createElement('thead');
        header.innerHTML = '<tr><th colspan="2">Auto Quest Completer</th></tr>';
        table.appendChild(header);
        let settingsBody = document.createElement('tbody');
        settingsBody.setAttribute('id', 'settings-scripts-autoquestcompleter');
        table.appendChild(settingsBody);
        let maxQuestsElem = document.createElement('tr');
        maxQuestsElem.innerHTML = `<td class="p-2 col-md-8">Max quest slots</td><td class="p-0 col-md-4"><select id="select-autoQuestMaxQuests" class="form-control">` +
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => `<option value="${i}">${i}</option>`).join('\n') + `</select></td>`;
        let maxSelect = maxQuestsElem.querySelector('#select-autoQuestMaxQuests');
        maxSelect.value = maxQuests;
        maxSelect.addEventListener('change', (event) => { changeMaxQuests(event); })
        settingsBody.appendChild(maxQuestsElem);
        let resetTimerElem = document.createElement('tr');
        resetTimerElem.innerHTML = '<td class="p-2 col-md-8">Quest reset timer (in minutes)</td><td class="p-0 col-md-4"><div style="display:flex;">' +
            '<input id="input-autoQuestResetTimer" type="text" placeholder="0 to disable" class="form-control">' +
            '<button id="input-autoQuestResetTimer-submit" class="btn btn-block btn-success" style="font-size: 8pt; flex: 0; min-width: 25%;">OK</button></div></td>';
        resetTimerElem.querySelector('#input-autoQuestResetTimer').value = questResetTimer;
        resetTimerElem.querySelector('#input-autoQuestResetTimer-submit').addEventListener('click', () => { changeQuestResetTimer(); })
        settingsBody.appendChild(resetTimerElem);
        
        // Quest types filtering
        let info = document.createElement('tr');
        info.innerHTML = `<td class="p-2" colspan="2"><label class="m-0">Preferred quest types</label></td>`;
        settingsBody.appendChild(info);
        info = document.createElement('tr');
        info.innerHTML = `<td class="p-2" colspan="2"><label class="m-0">(Auto Quests will refresh once all preferred quests are complete)</label></td>`;
        settingsBody.appendChild(info);
        Object.keys(QuestHelper.quests).forEach((type) => {
            let elem = document.createElement('tr');
            elem.innerHTML = `<td class="p-2"><label class="m-0 col-md-8" for="checkbox-autoQuestTypes-${type}">${type}</label></td>` + 
                `<td class="p-2 col-md-4"><input id="checkbox-autoQuestTypes-${type}" type="checkbox"></td>`;
            let checkbox = elem.querySelector(`#checkbox-autoQuestTypes-${type}`);
            checkbox.checked = !ignoredQuestTypes.includes(type);
            checkbox.addEventListener('change', () => { toggleIgnoreQuestType(type); });
            settingsBody.appendChild(elem);
        });
    }

    function toggleAutoQuest() {
        autoQuestEnabled = !autoQuestEnabled;
        if (autoQuestEnabled) {
            refreshQuestSubscriptions();
        } else {
            clearQuestSubscriptions();
        }
        if (!autoQuestEnabled && questResetState) {
            toggleQuestResetState();
        }
        const autoQuestBtn = document.getElementById('toggle-auto-quest');
        autoQuestBtn.classList.replace(...(autoQuestEnabled ? ['btn-danger', 'btn-success'] : ['btn-success', 'btn-danger']));
        autoQuestBtn.textContent = `Auto [${autoQuestEnabled ? 'ON' : 'OFF'}]`;
        localStorage.setItem('autoQuestEnabled', autoQuestEnabled);
    }

    function changeMaxQuests(event) {
        const newVal = +event.target.value;
        if (Number.isInteger(newVal) && 0 < newVal && newVal <= 10) {
            maxQuests = newVal;
            localStorage.setItem('autoQuestMaxQuests', maxQuests);
            beginQuests();
        }
    }

    function toggleQuestResetState() {
        questResetState = !questResetState;
        resetQuestResetTimeout();
        const questResetBtn = document.getElementById('toggle-auto-quest-reset');
        questResetBtn.classList.replace(...(questResetState ? ['btn-danger', 'btn-success'] : ['btn-success', 'btn-danger']));
        questResetBtn.textContent = `${questResetTimer} minute Reset Timer [${questResetState ? 'ON' : 'OFF'}]`;
        localStorage.setItem('autoQuestResetState', questResetState);
    }

    function changeQuestResetTimer() {
        const form = document.getElementById('input-autoQuestResetTimer');
        let val = +form.value;
        val = (Number.isInteger(val) && val > 0 ? val : 10);
        form.value = val;
        if (val != questResetTimer) {
            questResetTimer = val;
            resetQuestResetTimeout();
            document.getElementById('toggle-auto-quest-reset').textContent = `${questResetTimer} minute Reset Timer [${questResetState ? 'ON' : 'OFF'}]`;
            localStorage.setItem('autoQuestResetTimer', questResetTimer);
        }
    }

    function toggleIgnoreQuestType(type) {
        let i = ignoredQuestTypes.indexOf(type);
        if (i >= 0) {
            ignoredQuestTypes.splice(i, 1);
        } else {
            ignoredQuestTypes.push(type);
        }
        localStorage.setItem('autoQuestIgnoredQuestTypes', JSON.stringify(ignoredQuestTypes));
    }

    function refreshQuestSubscriptions() {
        // Dispose of old subscriptions
        clearQuestSubscriptions();

        // Subscribe to new quests
        App.game.quests.questList().forEach((quest, i) => {
            if (quest.isCompleted() && !quest.claimed() && !quest.autoComplete) {
                // Claim quest if already done
                App.game.quests.claimQuest(i);
            } else if (!quest.isCompleted()){
                // Subscribe to in-progress quests
                const sub = quest.isCompleted.subscribe(() => {
                    if (!quest.autoComplete && quest.inProgress() && quest.isCompleted()) {
                        App.game.quests.claimQuest(i);
                        beginQuests();
                        sub.dispose();
                    }
                });
                questSubscriptions.push(sub);
            }
        });

        beginQuests();
        resetQuestResetTimeout();
    }

    function clearQuestSubscriptions() {
        for (const sub of questSubscriptions) {
            sub.dispose();
        }
        questSubscriptions.length = 0;
    }

    function resetQuestResetTimeout() {
        clearTimeout(questResetTimeout);
        if (questResetState) {
            questResetTimeout = setTimeout(() => { App.game.quests.refreshQuests() }, questResetTimer * GameConstants.MINUTE);
        }
    }

    function beginQuests() {
        var preferredQuests = [];
        var ignoredQuests = [];
        App.game.quests.incompleteQuests().forEach((quest) => {
            if (!quest.inProgress() && !quest.isCompleted()) {
                let i = App.game.quests.questList.indexOf(quest);
                if (!ignoredQuestTypes.includes(quest.constructor.name)) {
                    preferredQuests.push(i);
                } else {
                    ignoredQuests.push(i);
                }
            }
        });
        // Add allowed quests before ignored quests
        let indices = preferredQuests.concat(ignoredQuests);
        for (let i of indices) {
            if (!App.game.quests.canStartNewQuest()) {
                break;
            }
            App.game.quests.beginQuest(i);
        }

        if (!App.game.quests.incompleteQuests().some((quest) => !ignoredQuestTypes.includes(quest.constructor.name))) {
            // Only filtered quests left
            if (App.game.quests.canAffordRefresh() && ignoredQuestTypes.length < Object.keys(QuestHelper.quests).length) {
                App.game.quests.refreshQuests();
            }
        }
    }

    function overrideMethods() {
        const generateQuestListOld = App.game.quests.generateQuestList;
        App.game.quests.generateQuestList = function(...args) {
            const res = generateQuestListOld.apply(this, ...args);
            if (autoQuestEnabled) {
                refreshQuestSubscriptions();
            }
            return res;
        }

        App.game.quests.canStartNewQuest = function() {
            // Check we haven't already used up all quest slots
            if (this.currentQuests().length >= maxQuests) {
                return false;
            }

            // Check at least 1 quest is either not completed or in progress
            if (this.questList().some(quest => !quest.isCompleted() && !quest.inProgress())) {
                return true;
            }

            return false;
        }
    }
}

function loadSetting(key, defaultVal) {
    var val;
    try {
        val = JSON.parse(localStorage.getItem(key));
        if (val == null || typeof val !== typeof defaultVal || (typeof val == 'object' && val.constructor.name !== defaultVal.constructor.name)) {
            throw new Error;
        }
    } catch {
        val = defaultVal;
        localStorage.setItem(key, JSON.stringify(defaultVal));
    }
    return val;
}

function loadScript(){
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args);
        if (App.game && !hasInitialized) {
            initAutoQuest();
            hasInitialized = true;
        }
        return result;
    }
}

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
