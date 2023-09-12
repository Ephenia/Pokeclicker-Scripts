class DesktopScriptHandler {
    static hasRegisteredUserScript = false;
    
    static getScriptEnabled(name, defaultVal = false) {
        var val = localStorage.getItem(name);
        val = JSON.parse(val);
        if (typeof val === 'boolean') {
            return val;
        }
        localStorage.setItem(name, defaultVal);
        return defaultVal;
    }

    static isEpheniaScriptEnabled(name) {
        return this.getScriptEnabled(name, false);
    }

    static isUserScriptEnabled(name) {
        return this.getScriptEnabled(name, true);
    }

    static registerEpheniaScript(name) {
        const enabled = this.isEpheniaScriptEnabled(name);

        if (name == 'scriptfixerupper') {
            // Display scriptfixerupper separately from the normal scripts
            const settingContainer = 'settings-scripts-desktopSettings';
            const customText = 'Enable scriptfixerupper (reset script settings)';
            this.addScriptEnabledSetting(name, settingContainer, enabled, customText, false);
        } else {
            const settingContainer = 'settings-scripts-enableScriptsEphenia';
            this.addScriptEnabledSetting(name, settingContainer, enabled);
        }
    }

    static registerUserScript(name) {
        const settingContainer = 'settings-scripts-enableScriptsUser';
        const enabled = this.isUserScriptEnabled(name);

        // Remove no scripts installed message
        if (!this.hasRegisteredUserScript) {
            document.getElementById('settings-scripts-enableScriptsUser').innerHTML = '';
            this.hasRegisteredUserScript = true;
        }

        this.addScriptEnabledSetting(name, settingContainer, enabled);
    }

    static addScriptEnabledSetting(name, container, enabled, customText = null, alphabetical = true) {
        var setting = document.createElement('tr')
        setting.innerHTML =
        `<td class="p-2 col-md-8"><label class="m-0" for="checkbox-${name}">${customText || `Enable ${name}`}</label></td>` + 
            `<td class="p-2 col-md-4"><input id="checkbox-${name}" type="checkbox"></td>`;

        container = document.getElementById(container);
        // Insert setting in alphabetical order
        if (alphabetical) {
            let settingsList = Array.from(container.children);
            let insertBefore = settingsList.find(elem => elem.querySelector('input').id > 'checkbox-' + name);
            if (insertBefore) {
                insertBefore.before(setting);
            } else {
                container.appendChild(setting);
            }
        } else {
            container.appendChild(setting);
        }

        document.getElementById('checkbox-'+ name).checked = enabled;
        document.getElementById('checkbox-'+ name).addEventListener('change', event => {
            localStorage.setItem(name, event.target.checked);
        });
    }

    // Should only be called by main.js once per game launch!
    static shouldScriptsAutoUpdate() {
        var returnval = this.scriptAutoUpdatesEnabled() || this.updateScriptsNextLaunch();
        // Clear one-time update flag
        localStorage.setItem('epheniaUpdateScriptsNextLaunch', false);
        return returnval;
    }

    static scriptAutoUpdatesEnabled() {
        var val = localStorage.getItem('epheniaScriptAutoUpdates');
        val = JSON.parse(val);
        return val !== false;
    }

    static updateScriptsNextLaunch() {
        var val = localStorage.getItem('epheniaUpdateScriptsNextLaunch');
        val = JSON.parse(val);
        return val === true;
    }

    static init() {
        console.log('Loading Pokéclicker Scripts Desktop scripthandler');

        // Fixes the Scripts nav item getting wrapped to the bottom by increasing the max width of the window
        document.getElementById('settingsModal').querySelector('div').style.maxWidth = '850px';

        // Select the top header row of tabs in Settings
        const settingTabs = document.querySelector('#settingsModal ul.nav-tabs');

        let li = document.createElement('li');
        li.classList.add('nav-item');
        li.innerHTML = `<a class="nav-link" href="#settings-scripts" data-toggle="tab">Scripts</a>`;
        settingTabs.appendChild(li);

        // Select the parent element that contains the content of the tabs
        const tabContent = document.querySelector('#settingsModal .tab-content');

        // Create and append the content for the script tab to Settings
        let div = document.createElement('div');
        div.classList.add('tab-pane');
        div.setAttribute('id', 'settings-scripts');

        let table = document.createElement('table');
        table.classList.add('table', 'table-striped', 'table-hover', 'm-0');
        div.appendChild(table);

        let tableSections = [['desktopSettings', 'Pokéclicker Scripts desktop settings'],
            ['enableScriptsEphenia', 'Downloaded scripts'],
            ['enableScriptsUser', 'User-added scripts']];
        tableSections.forEach(([id, desc]) => {
            let elem = document.createElement('thead');
            elem.innerHTML = `<tr><th colspan="2">${desc}</th></tr>`;
            table.appendChild(elem);

            elem = document.createElement('tbody');
            elem.setAttribute('id', 'settings-scripts-' + id);
            table.appendChild(elem);
        });

        tabContent.appendChild(div);

        // Add info about restarting to the top
        let info = document.createElement('tr');
        info.innerHTML = `<td class="p-2" colspan="2"><label class="m-0">Settings changes will take effect on restart</label></td>`;
        document.getElementById('settings-scripts-desktopSettings').appendChild(info);

        // Add temporary no-user-added-scripts text
        info = document.createElement('tr');
        info.innerHTML = `<td class="p-2" colspan="2"><label class="m-0">No scripts installed</label></td>`;
        document.getElementById('settings-scripts-enableScriptsUser').appendChild(info);


        // Add setting to disable script auto-updates
        let setting = document.createElement('tr')
        setting.innerHTML =
            `<td class="p-2 col-md-8"><label class="m-0" for="checkbox-scriptAutoUpdates">Script auto-updates enabled</label></td>` + 
            `<td class="p-2 col-md-4"><input id="checkbox-scriptAutoUpdates" type="checkbox"></td>`;
        document.getElementById('settings-scripts-desktopSettings').appendChild(setting);
        document.getElementById('checkbox-scriptAutoUpdates').checked = this.scriptAutoUpdatesEnabled();
        document.getElementById('checkbox-scriptAutoUpdates').addEventListener('change', event => {
            localStorage.setItem('epheniaScriptAutoUpdates', event.target.checked);
        });
        // Add auto-updated-disabled-specific setting to update next launch
        if (!this.scriptAutoUpdatesEnabled()) {
            setting = document.createElement('tr');
            setting.innerHTML =
                `<td class="p-2 col-md-8"><label class="m-0" for="checkbox-updateScriptsNextLaunch">Update scripts on next game launch</label></td>` + 
                `<td class="p-2 col-md-4"><input id="checkbox-updateScriptsNextLaunch" type="checkbox"></td>`;
            document.getElementById('settings-scripts-desktopSettings').appendChild(setting);
            document.getElementById('checkbox-updateScriptsNextLaunch').addEventListener('change', event => {
                localStorage.setItem('epheniaUpdateScriptsNextLaunch', event.target.checked);
            });
        }

    }
}

DesktopScriptHandler.init();
