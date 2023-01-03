function initManager(){
    console.log('ran scripthandler')
    var scriptElement = document.createElement('div')
    scriptElement.id = 'scriptHandler'
    document.body.appendChild(scriptElement)
    function loadSettings(){
        var addSettings = setInterval(function(){
            try{
                //Fixes the Scripts nav item getting wrapped to the bottom by increasing the max width of the window
                document.getElementById('settingsModal').querySelector('div').style.maxWidth = '850px'

                //Select the top header row of tabs in Settings
                const settingTabs = document.querySelectorAll('.nav.nav-tabs.nav-fill')[1];

                //Create and append the new tab for scripts to Settings
                let scriptFrag = new DocumentFragment();
                let li = document.createElement('li');
                li.classList.add('nav-item');
                li.innerHTML = `<a class="nav-link" href="#settings-scripts" data-toggle="tab">Scripts</a>`;
                scriptFrag.appendChild(li);
                settingTabs.appendChild(scriptFrag);

                //Select the parent element that contains the content of the tabs
                const tabContent = document.querySelectorAll('.tab-content')[3];

                //Create and append the content for the script tab to Settings
                scriptFrag = new DocumentFragment();
                let div = document.createElement('biv');
                div.classList.add('tab-pane');
                div.setAttribute('id', 'settings-scripts')

                //Add the table and tbody elements to match the other tabs
                const scriptTabContent = 
                `<table class="table table-striped table-hover m-0"><tbody></tbody></table>`
                div.innerHTML = `${scriptTabContent}`;
                scriptFrag.appendChild(div);
                tabContent.appendChild(scriptFrag);

                //Add a setting to enable each script in the scripts settings menu
                document.getElementById('scriptHandler').childNodes.forEach(childNode => {
                    var setting = document.createElement('tr')
                    setting.innerHTML =
                    `<td class="p-2">
                            <label class="m-0">Enable ` + childNode.id + `</label>
                        </td>
                        <td class="p-2 tight">
                            <input id="Toggle-`+ childNode.id + `" type="checkbox">
                        </td>`
            
                    document.getElementById('settings-scripts').querySelector('table tbody').prepend(setting)
                    //Check if the checkbox should be filled or not
                    document.getElementById('Toggle-'+ childNode.id).checked = localStorage.getItem(childNode.id) == 'true' ? true : false
                    document.getElementById('Toggle-'+ childNode.id).addEventListener('change', event => {
                        if (event.target.checked == false) {
                            localStorage.setItem(childNode.id, "false");
                        } else {
                            localStorage.setItem(childNode.id, "true");
                        }
                    });
                })
                //Add info about restarting to the top
                var info = document.createElement('tr')
                info.innerHTML =
                `<td class="p-2">
                        <label class="m-0">The script settings will take effect on restart</label>
                    </td>`
                document.getElementById('settings-scripts').querySelector('table tbody').prepend(info)
                
                clearInterval(addSettings)
            } catch(err) { }
        }, 100)
    }
    
    function loadScript(){
        var scriptLoad = setInterval(function () {
            try {
                newSave = document.querySelectorAll('label')[0];
                trainerCards = document.querySelectorAll('.trainer-card');
            } catch (err) { }
            if (typeof newSave != 'undefined') {
                for (var i = 0; i < trainerCards.length; i++) {
                    trainerCards[i].addEventListener('click', loadSettings, false);
                }
                newSave.addEventListener('click', loadSettings, false);
                clearInterval(scriptLoad)
            }
        }, 50);
    }
    
    loadScript();
    
}

initManager();