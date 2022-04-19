function initManager(){
    console.log('ran scripthandler')
    var scriptElement = document.createElement('div')
    scriptElement.id = 'scriptHandler'
    document.body.appendChild(scriptElement)
    //localStorage.removeItem('additionalvisualsettings')
    function loadSettings(){
        var addSettings = setInterval(function(){
            try{
                //Add a setting to enable each script in the other settings menu
                document.getElementById('scriptHandler').childNodes.forEach(childNode => {
                    var setting = document.createElement('tr')
                    setting.innerHTML =
                    `<td class="p-2">
                            <label class="m-0">Enable ` + childNode.id + `</label>
                        </td>
                        <td class="p-2 tight">
                            <input id="Toggle-`+ childNode.id + `" type="checkbox">
                        </td>`
            
                    document.getElementById('settings-other').querySelector('table tbody').prepend(setting)
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
                document.getElementById('settings-other').querySelector('table tbody').prepend(info)
                
                clearInterval(addSettings)
            } catch(err) {
                console.error(err)
            }
            
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