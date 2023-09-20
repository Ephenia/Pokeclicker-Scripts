// ==UserScript==
// @name          [Pokeclicker] Additional Visual Settings
// @namespace     Pokeclicker Scripts
// @author        Ephenia (Credit: Optimatum)
// @description   Adds additional settings for hiding some visual things to help out with performance. Also, includes various features that help with ease of accessibility.
// @copyright     https://github.com/Ephenia
// @license       GPL-3.0 License
// @version       2.5

// @homepageURL   https://github.com/Ephenia/Pokeclicker-Scripts/
// @supportURL    https://github.com/Ephenia/Pokeclicker-Scripts/issues
// @downloadURL   https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/additionalvisualsettings.user.js
// @updateURL     https://raw.githubusercontent.com/Ephenia/Pokeclicker-Scripts/master/additionalvisualsettings.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @grant         none
// @run-at        document-idle
// ==/UserScript==

var scriptName = 'additionalvisualsettings';

var wildPokeNameDisabled = ko.observable(false);
var wildPokeDefeatDisabled = ko.observable(false);
var wildPokeImgDisabled = ko.observable(false);
var wildPokeHealthDisabled = ko.observable(false);
var wildPokeCatchDisabled = ko.observable(false);
var avsDisableNotifications;

function initVisualSettings() {
    // Add shortcut menu icons
    const getMenu = document.getElementById('startMenu');
    const shortcutsToAdd = [
        ['quick-settings', '#settingsModal', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAkZQTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAU1tsSEhgGyM0AAAAu8Pcu8PUwMDYKSk5AAAAAAAAoqq7AAAAAAAAe3uUxMTdu8TcvcXet7fIgJGiAAAAs7vUwsLTx8fYw8PUt8jZAAAAAAAAZWV2v7/hMTlKtLS8vMTVucLavMTdAAAAAAAASEhIJycncXFxcXl5c3N7cnJyZmZmu7vUAAAAAAAAtLzNv7/QRERE////t7e3xMTEQEBAFRUVdHR8aGhwAAAAdXV1vLzNc3OEAAAACgoKs7vLAgIKdHR0dXV9BgYOtLzEAAAAAAAAAAAAe4OTOjpCVFRcKTE5xMTVAAABBgYGbW11b29vAAAAAAAArr/QtsfYpqa3MDAwAA0eAFZnAFZ4AA0vAAAAEBAQvcbWMjtLISEhAEVnAJO0CbbfAKHUAJK0AAAeb2+ACQkJv7/YSUlaNDQ0IYepAJC5AI3AISEyvb3Wa3OEXWV2HT8/DZW3AJKzCZGzAAAICSsrAAUFAHudAIytAGuNKTFCMjJLRUVWACYmAHmSACwsDAwMICAgAAAAm5u0RUVFAAojABMjvLzecnJ7YWFyKSk6Y2t7S0tLBwcHAAANh4eYAAAJanJybXV1VFRUAgoKrq6uAgIDNjpTVGVlWlpaeXl5cnt7CgoTqqqzmpqqOztbMTlKY2N4na6uKioqERERcnJ6ChMTvLzVY2N4YGF2wMDiMjIyCAgIExsbtLTEOj1FjIydOkBAs8TVL0BAWWp7YmJzkpqzc3uMdnaHAAAAI+eLBgAAAMJ0Uk5TABFE/6rdd////2b/////iFX/Qv3////////v//////+E4f////////9x3P//////////5fv/////////////Uf///zP/////////DzGo////////////u+7//////////yL/////////////////////////////////////////////////////if//////////////////////////E///////////DAP/////////gv///////////////////5k2RgJ2AAACq0lEQVR4nJXUaVfTQBQGYPBFUZNqtTRFKa3SElCBVqQQLNEARXFfqtgGt4qKYkVQEEXcxR1w38UdRcUNrIr7P3MmCdDQw+F4P83JPHPv5E4mcXH/HfGjijEAErTxWIwbiSSO1+aACcDEGEMIw7CGSZhsNBqBKSxL2DAz1ZRk5khYoEQyHU8D9HucbjKrKMVqTU212ejYnqzPNWNmmsPBWQwGp5rJmc5nZHCZejRrtoKcmIOs7ByXey6cubkEGXXl5uU5PPkoEArne4tEGguQzjuH7XyhycEDAqlUCAWJEopLUKpDeb6yRYtVVFBerrIlS6P3tGz5CthXrlKRoGUSxdVr1voHUpWaTGTOtk4S10MQBK+3osKtIBd4v3+DigIIynKwcqMkutw+YNPmLVtVJGYFS2g/QvRAtskcV7U9J4c+37Gzetfumj1hOg5Le2tZfp+yMdQRxMDlohOor95/oKa+QSQZCGpkec9BBTWxFKkVDh2ubm5uPtIikhcIh8FwHNsUg45qSO3ZCOjYcYJOnGwRaChIrlPQKQ/PNp6ukCg603qWBM7RTOcvoGoAXQT8ibWXLiuoobWtrb3d7ZYI8vq8tDlq20PjSPUOEOQmA1ESr9DXRF3YZwtevTb03Seg4/oNUSS9vKkh0hCvz04WBQZvROjW7cw7dDmyB05OvIsyt9LtqHvAMLgH3B9CDx7y6HwUjUJ4LCfjyVO17+Rrevb8hacLL191RyEjXstW65u3PT3a2b57zzm6PnR+7NaVqyWN+yT39uFzUVFfL2OwcI5IEr7oqn1Vkd1eXJyfn2KhV8ocieCbfuP9/eR5pgfffzT91JB52B2OB9LI81/qtUPEwDJMJfQdiKP/Efz+oy0FDGwXYg3dlx+BwbwkjDFEmRu8ZvGBv7FZRol/3T2xhRzFta4AAAAASUVORK5CYII='],
        ['quick-inventory', '#showItemsModal', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4BAMAAABaqCYtAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAACdQTFRFAAAA0KhgoHhA+PCw+OB46MhgQEhoqKioeHh4WFhYuEgA2GgAgCgAQaYPaAAAAA10Uk5TAP///////////////y0EQa0AAAH3SURBVHictdTNkpNAEABg5IBXe7bgnGGJOSuU3kmT8koq4xnWdZKjFasSHsBKyBuQV/AR9OKj2TP8zMCa1YtdRULPR1MzTIPj/D1ewKsbieO4d/Fbk93Hb2aOncbJkLvL2L7UjacYm9L5J8K0zyLCd+sBcxYnaBCXMfeH+0CAiFnRZt6GkhJmA0KEKLrUFYgpDOgBPKKAoM1KELgCKAyynIUh6AhD7vMRBms1xzaSdF6OK40pHVcyjK3Af0W9lBFaS3kWHf4UmWOjPdsnqErfH49fVeEIS4WoTCkqDCx8pBGsFdbqbGVjsKeRD7WOb3S6KA16wWGM27IwyI50X4LuZ3XkBt1wt9+gLqJyzBancHgG7l3y+rzf9Jgtqofl0Ln3ccJ354PsYlud2LLvXFdtA9vV9VVHXZ+42qTZgBEwOQSH1CDNPULVPG0AYEpDBmklmS905NS3Bj1kcorff/74pXErL9fbWNUyuoWefICbSC30DNJLNEVhLeV/4ZyOHgnWwjwhQhodUAiFhUHfxtzGTPA819W6yveZ2PRIl3LwgbfIIAdGd+la7DMAvefA228CoyMA+Nh3Ju3+GGnA9CZtm43y4NixraQV5ynWzbWLSz3Bl9Xl0mPTnL+M0NOVTaMuocpihI6k4Ua9ZPTXSGcSnplPMbU/xm/a6CAG6AGINQAAAABJRU5ErkJggg=='],
        ['quick-pokedex', '#pokedexModal', 'data:image/png;base64,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YWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczppcHRjRXh0PSJodHRwOi8vaXB0Yy5vcmcvc3RkL0lwdGM0eG1wRXh0LzIwMDgtMDItMjkvIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6cGx1cz0iaHR0cDovL25zLnVzZXBsdXMub3JnL2xkZi94bXAvMS4wLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6NzMwODk4ZTQtNmFlNy00OTg4LTkxY2QtMWZjNzljOWM2YWMyIgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjdlN2U2MmY1LTIyNWMtNGU0YS04NjlhLTJmYjRlYzg1ODUyZSIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjk0YzQwZGZmLTBkODctNDc1Ny1iZDNlLWZhZjQ5ZDg5MTU3ZSIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iV2luZG93cyIKICAgR0lNUDpUaW1lU3RhbXA9IjE2NTI2MjA2NTQ2Mzk5MjQiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4yMiIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIj4KICAgPGlwdGNFeHQ6TG9jYXRpb25DcmVhdGVkPgogICAgPHJkZjpCYWcvPgogICA8L2lwdGNFeHQ6TG9jYXRpb25DcmVhdGVkPgogICA8aXB0Y0V4dDpMb2NhdGlvblNob3duPgogICAgPHJkZjpCYWcvPgogICA8L2lwdGNFeHQ6TG9jYXRpb25TaG93bj4KICAgPGlwdGNFeHQ6QXJ0d29ya09yT2JqZWN0PgogICAgPHJkZjpCYWcvPgogICA8L2lwdGNFeHQ6QXJ0d29ya09yT2JqZWN0PgogICA8aXB0Y0V4dDpSZWdpc3RyeUlkPgogICAgPHJkZjpCYWcvPgogICA8L2lwdGNFeHQ6UmVnaXN0cnlJZD4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MGIzZjhkNTAtNjQ2My00NjJlLTkzZGEtOTM0OWNhOTE1YWFkIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIyLTA1LTE1VDE1OjE3OjM0Ii8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICAgPHBsdXM6SW1hZ2VTdXBwbGllcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkltYWdlU3VwcGxpZXI+CiAgIDxwbHVzOkltYWdlQ3JlYXRvcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkltYWdlQ3JlYXRvcj4KICAgPHBsdXM6Q29weXJpZ2h0T3duZXI+CiAgICA8cmRmOlNlcS8+CiAgIDwvcGx1czpDb3B5cmlnaHRPd25lcj4KICAgPHBsdXM6TGljZW5zb3I+CiAgICA8cmRmOlNlcS8+CiAgIDwvcGx1czpMaWNlbnNvcj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pn9Za1QAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAHdElNRQfmBQ8NESISKzy+AAAA3ElEQVQoz5WSIXrDMAyFf3cBA4MBPYKPIRjoIwwWFg7mCIU+QqCgoeBgYGDhQA4wpoLGWZaFTMRP+t57ki0HdiEivs3NLGzzZk+8mO0d/I9QRHwAH2P07/zhY4w+xugD+ADeg1fDUxXFGInXBO/981xqAHHT8EVE/GJG27bMnxPt6xfTTVfCPM8AvN3vINI3WyeA6aZcz2cO71NHqoSKSymklMgiTxPAFtwAlFLoum4V5Zx/8EJMKaGqhPpKpZSVVMUppbWmqphZOB251pGOIuwXtyeq6q+Nh/9+jQcRyGEasqbeQgAAAABJRU5ErkJggg=='],
    ];
    shortcutsToAdd.forEach(([id, modal, source]) => {
        const quickElem = document.createElement('img');
        quickElem.id = id;
        quickElem.src = source;
        quickElem.setAttribute('href', modal);
        quickElem.setAttribute('data-toggle', 'modal');
        getMenu.prepend(quickElem);
    });

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

    // Add AVS settings options to scripts tab
    let table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-hover', 'm-0');
    scriptSettings.prepend(table);
    let header = document.createElement('thead');
    header.innerHTML = '<tr><th colspan="2">Additional Visual Settings</th></tr>';
    table.appendChild(header);
    let settingsBody = document.createElement('tbody');
    settingsBody.setAttribute('id', 'settings-scripts-additionalvisualsettings');
    table.appendChild(settingsBody);
    let settingsToAdd = [['poke-name', 'Show wild Pokémon Name'],
        ['poke-defeat', 'Show wild Pokémon Defeated'],
        ['poke-image', 'Show wild Pokémon Image'],
        ['poke-health', 'Show Pokémon Health'],
        ['poke-catch', 'Show Catch Icon'],
        ['all-notify', 'Disable all Notifications']];
    settingsToAdd.forEach(([id, desc]) => {
        let elem = document.createElement('tr');
        elem.innerHTML = `<td class="p-2"><label class="m-0 col-md-8" for="checkbox-${id}">${desc}</label></td>` + 
            `<td class="p-2 col-md-4"><input id="checkbox-${id}" type="checkbox"></td>`;
        settingsBody.appendChild(elem);
    });

    document.getElementById('checkbox-poke-name').checked = !wildPokeNameDisabled();
    document.getElementById('checkbox-poke-defeat').checked = !wildPokeDefeatDisabled();
    document.getElementById('checkbox-poke-image').checked = !wildPokeImgDisabled();
    document.getElementById('checkbox-poke-health').checked = !wildPokeHealthDisabled();
    document.getElementById('checkbox-poke-catch').checked = !wildPokeCatchDisabled();
    document.getElementById('checkbox-all-notify').checked = avsDisableNotifications;

    document.getElementById('checkbox-poke-name').addEventListener('change', event => {
        wildPokeNameDisabled(!event.target.checked);
        localStorage.setItem("wildPokeNameDisabled", wildPokeNameDisabled());
    });

    document.getElementById('checkbox-poke-defeat').addEventListener('change', event => {
        wildPokeDefeatDisabled(!event.target.checked);
        localStorage.setItem("wildPokeDefeatDisabled", wildPokeDefeatDisabled());
    });

    document.getElementById('checkbox-poke-image').addEventListener('change', event => {
        wildPokeImgDisabled(!event.target.checked);
        localStorage.setItem("wildPokeImgDisabled", wildPokeImgDisabled());
    });

    document.getElementById('checkbox-poke-health').addEventListener('change', event => {
        wildPokeHealthDisabled(!event.target.checked);
        localStorage.setItem("wildPokeHealthDisabled", wildPokeHealthDisabled());
    });

    document.getElementById('checkbox-poke-catch').addEventListener('change', event => {
        wildPokeCatchDisabled(!event.target.checked);
        localStorage.setItem("wildPokeCatchDisabled", wildPokeCatchDisabled());
    });

    document.getElementById('checkbox-all-notify').addEventListener('change', event => {
        avsDisableNotifications = event.target.checked;
        localStorage.setItem("avsDisableNotifications", avsDisableNotifications);
    });

    overrideNotifications();

    // Create travel shortcut buttons on town map
    const travelShortcutsToAdd = [
        ['dock-button', 'Dock', {left: 32, top: 0}, MapHelper.openShipModal],
        ['gyms-button', 'Gyms', {left: 75, top: -8}, () => { generateRegionGymsList(); $('#gymsShortcutModal').modal('show'); }],
        ['dungeons-button', 'Dungeons', {left: 121, top: -8}, () => { generateRegionDungeonssList(); $('#dungeonsShortcutModal').modal('show'); }],
    ];

    travelShortcutsToAdd.forEach(([id, name, pos, func]) => {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = name;
        button.className = 'btn btn-block btn-success';
        button.style = `position: absolute; left: ${pos.left}px; top: ${pos.top}px; width: auto; height: 41px; font-size: 11px;`;
        button.addEventListener('click', func);
        document.getElementById('townMap').appendChild(button);
    });

    // Create gym and dungeon shortcut modals
    const modalNames = ['gyms', 'dungeons'];
    const fragment = new DocumentFragment();
    for (const name of modalNames) {
        const customModal = document.createElement('div');
        customModal.setAttribute('class', 'modal noselect fade');
        customModal.setAttribute('tabindex', '-1');
        customModal.setAttribute('role', 'dialogue');
        customModal.setAttribute('id', `${name}ShortcutModal`);
        customModal.setAttribute('aria-labelledby', `${name}ShortcutModalLabel`);
        customModal.innerHTML = `<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-sm" role="document">
            <div class="modal-content">
                <div class="modal-header" style="justify-content: space-around;">
                    <h5 id="${name}-shortcut-modal-title" class="modal-title"></h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body bg-ocean">
                    <div id="${name}-shortcut-buttons"></div>
                </div>
            </div>
        </div>`;
        fragment.appendChild(customModal);
    }
    document.getElementById('ShipModal').after(fragment);

    addGlobalStyle('.pageItemTitle { height:38px }');
    addGlobalStyle('#quick-settings, #quick-inventory, #quick-pokedex { height: 36px; background-color: #eee; border: 4px solid #eee; cursor: pointer; image-rendering: pixelated; }');
    addGlobalStyle('#quick-pokedex { padding: 2px; }')
    addGlobalStyle(':is(#quick-settings, #quick-inventory, #quick-pokedex):hover { background-color:#ddd; border: 4px solid #ddd; }');
    addGlobalStyle('#shortcutsContainer { display: block !important; }');
    addGlobalStyle('.gyms-shortcut-leaders { display: flex; pointer-events: none; position: absolute; height: 36px; top: 0; left: 0; image-rendering: pixelated; }');
    addGlobalStyle('.gyms-shortcut-badges { position: absolute; height: 36px; display: flex; top: 0; right: 0; }');
    addGlobalStyle('.dungeons-shortcut-costs { position: relative; margin-right: 12px; filter: none !important }');
    addGlobalStyle('#dungeons-shortcut-buttons > button:hover { -webkit-animation: bounceBackground 60s linear infinite alternate; animation: bounceBackground 60s linear infinite alternate; }');
    addGlobalStyle('#dungeons-shortcut-buttons > button * { z-index: 2 }');
    addGlobalStyle('.dungeons-shortcut-overlay { width: 100%; height: 100%; position: absolute; background-color: rgba(0,0,0,0.45); margin-top: -6px; margin-left: -8px; z-index: 1 !important }');
    addGlobalStyle('.dungeons-shortcut-info { position: relative; font-weight: bold }');

    function overrideNotifications() {
        Notifier.oldNotifyAVS = Notifier.notify;
        Notifier.notify = function(...args) {
            if (avsDisableNotifications) {
                if (args.length && args[0].sound) {
                    args[0].sound.play();
                }
            } else {
                return Notifier.oldNotifyAVS(...args);
            }
        }
    }

    function generateRegionGymsList() {
        const gymsBtns = document.getElementById('gyms-shortcut-buttons');
        const gymsHead = document.getElementById('gyms-shortcut-modal-title');
        gymsHead.textContent = `Gym Select (${GameConstants.camelCaseToString(GameConstants.Region[player.region])})`;
        gymsBtns.innerHTML = '';
        const fragment = new DocumentFragment();
        const regionGyms = Object.values(GymList).filter((gym) => gym.parent?.region === player.region);
        for (const gym of regionGyms) {
            const hasBadgeImage = !BadgeEnums[gym.badgeReward].startsWith('Elite') && BadgeEnums[gym.badgeReward] != 'None';
            const badgeImage = (hasBadgeImage ? `assets/images/badges/${BadgeEnums[gym.badgeReward]}.png` : '');
            const btn = document.createElement('button');
            btn.setAttribute('style', 'position: relative;');
            btn.setAttribute('class', 'btn btn-block btn-success');
            btn.addEventListener('click', () => {
                if (!MapHelper.isTownCurrentLocation(gym.parent.name)) {
                    MapHelper.moveToTown(gym.parent.name);
                }
                $("#gymsShortcutModal").modal("hide");
                GymRunner.startGym(gym); 
            });
            btn.disabled = !(gym.isUnlocked() && MapHelper.calculateTownCssClass(gym.parent.name));
            btn.innerHTML = `<div class="gyms-shortcut-leaders">
                <img src="assets/images/gymLeaders/${gym.leaderName}.png" onerror="{ this.onerror=null; this.style.display='none'; }">
                </div>
                <div class="gyms-shortcut-badges">
                <img src="${badgeImage}" onerror="{ this.onerror=null; this.style.display='none'; }">
                </div>
                ${gym.leaderName}`;
            fragment.appendChild(btn);
        }
        gymsBtns.appendChild(fragment);
    }

    function generateRegionDungeonssList() {
        const dungeonsBtns = document.getElementById('dungeons-shortcut-buttons');
        const dungeonsHead = document.getElementById('dungeons-shortcut-modal-title');
        dungeonsHead.textContent = `Dungeon Select (${GameConstants.camelCaseToString(GameConstants.Region[player.region])})`;
        dungeonsBtns.innerHTML = '';
        const fragment = new DocumentFragment();
        const dungeonTowns = Object.values(TownList).filter((town) => (town.region === player.region && town.constructor.name === 'DungeonTown' && town.dungeon != null));
        for (const town of dungeonTowns) {
            const dungeon = town.dungeon;
            const dungeonClears = App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dungeon.name)]();
            const canAffordEntry = App.game.wallet.currencies[GameConstants.Currency.dungeonToken]() >= dungeon.tokenCost;
            const canAccess = town.isUnlocked() && dungeon.isUnlocked() && canAffordEntry;
            const btn = document.createElement('button');
            btn.setAttribute('style', `position: relative; background-image: url("assets/images/towns/${dungeon.name}.png"); background-position: center;opacity: ${canAccess ? 1 : 0.70}; filter: brightness(${canAccess ? 1 : 0.70});`);
            btn.setAttribute('class', 'btn btn-block btn-success');
            btn.addEventListener('click', () => {
                if (!MapHelper.isTownCurrentLocation(town.name)) {
                    MapHelper.moveToTown(town.name);
                }
                $('#dungeonsShortcutModal').modal('hide');
                DungeonRunner.initializeDungeon(dungeon);
            });
            btn.disabled = !canAccess;
            btn.innerHTML = `<div class="dungeons-overlay"></div>
                <div class="dungeons-shortcut-costs">
                <img src="assets/images/currency/dungeonToken.svg" style="height: 24px; width: 24px;">
                <span style="font-weight: bold;color: ${canAffordEntry ? 'greenyellow' : '#f04124'}">${dungeon.tokenCost.toLocaleString('en-US')}</span>
                </div>
                <div class="dungeons-shortcut-info">
                <span>${dungeon.name}</span>
                <div>${dungeonClears.toLocaleString('en-US')} clears</div>
                </div>`;
            fragment.appendChild(btn);
        }
        dungeonsBtns.appendChild(fragment);
    }
}

function addGraphicsBindings() {
    // Must execute before game loads and applies knockout bindings

    // Make variables accessible for compatibility with userscript extensions
    window.AVSObservables = {
        'wildPokeNameDisabled': wildPokeNameDisabled,
        'wildPokeDefeatDisabled': wildPokeDefeatDisabled,
        'wildPokeImgDisabled': wildPokeImgDisabled,
        'wildPokeHealthDisabled': wildPokeHealthDisabled,
        'wildPokeCatchDisabled': wildPokeCatchDisabled,
    };

    const routeBattleView = document.querySelector('.battle-view > div[data-bind="if: App.game.gameState === GameConstants.GameState.fighting"');

    // Remove pokemon name
    routeBattleView.querySelector('.pageItemTitle > knockout').setAttribute('data-bind', 'ifnot: AVSObservables.wildPokeNameDisabled');
    // Remove pokemon defeated count
    const pokeDefeat = routeBattleView.querySelector('.pageItemFooter knockout[data-bind*="App.game.statistics.routeKills"]');
    pokeDefeat.before(new Comment('ko ifnot: AVSObservables.wildPokeDefeatDisabled'));
    pokeDefeat.after(new Comment('/ko'));
    // Remove pokemon images
    const pokeImg = routeBattleView.querySelector('knockout[data-bind*="pokemonSpriteTemplate"]');
    pokeImg.before(new Comment('ko ifnot: AVSObservables.wildPokeImgDisabled'));
    pokeImg.after(new Comment('/ko'));
    // Remove pokemon healthbar
    const pokeHealth = routeBattleView.querySelector('div.progress.hitpoints');
    pokeHealth.before(new Comment('ko ifnot: AVSObservables.wildPokeHealthDisabled'));
    pokeHealth.after(new Comment('/ko'));
    // Remove catch animation
    const pokeCatch = routeBattleView.querySelector('div.catchChance');
    pokeCatch.before(new Comment('ko ifnot: AVSObservables.wildPokeCatchDisabled'));
    pokeCatch.after(new Comment('/ko'));
}


function addOptimizeVitamins() {
    // Add button to vitamin menu
    // (must execute before game loads and applies knockout bindings)
    const btn = document.createElement('button');
    btn.setAttribute('class', 'btn btn-link btn-sm text-decoration-none align-text-top');
    btn.setAttribute('style', 'line-height: 0.6; font-size: 1rem; float: right;');
    btn.setAttribute('data-bind', `click: () => { if ($data) { $data.optimizeVitamins() } }, class: (!$data.breeding ? 'text-success' : 'text-muted')`);
    btn.innerHTML = '⚖';
    document.querySelector('#pokemonVitaminExpandedModal tbody[data-bind*="PartyController.getvitaminSortedList"] td').appendChild(btn);

    // Add optimize-vitamin functions for party pokemon (adapted from wiki)
    PartyPokemon.prototype.calcBreedingEfficiency = function(vitaminsUsed) {
        // attack bonus
        const attackBonusPercent = (GameConstants.BREEDING_ATTACK_BONUS + vitaminsUsed[GameConstants.VitaminType.Calcium]) / 100;
        const proteinBoost = vitaminsUsed[GameConstants.VitaminType.Protein];
        const breedingAttackBonus = (this.baseAttack * attackBonusPercent) + proteinBoost;
        // egg steps
        const div = 300;
        const extraCycles = (vitaminsUsed[GameConstants.VitaminType.Calcium] + vitaminsUsed[GameConstants.VitaminType.Protein]) / 2;
        const steps = (this.eggCycles + extraCycles) * GameConstants.EGG_CYCLE_MULTIPLIER;
        const adjustedSteps = (steps <= div ? steps : Math.round(((steps / div) ** (1 - vitaminsUsed[GameConstants.VitaminType.Carbos] / 70)) * div));
        // efficiency
        return (breedingAttackBonus / adjustedSteps) * GameConstants.EGG_CYCLE_MULTIPLIER;
    }

    PartyPokemon.prototype.optimizeVitamins = function() {
        const totalVitamins = (player.highestRegion() + 1) * 5;
        const carbosUnlocked = player.highestRegion() >= GameConstants.Region.unova;
        const calciumUnlocked = player.highestRegion() >= GameConstants.Region.hoenn;
        // Add our initial starting efficiency here
        let optimalVitamins = [0, 0, 0];
        let eff = this.calcBreedingEfficiency(optimalVitamins);
        // Check all max-vitamin combinations
        for (let carbos = carbosUnlocked * totalVitamins; carbos >= 0; carbos--) {
            for (let calcium = calciumUnlocked * (totalVitamins - carbos); calcium >= 0; calcium--) {
                let protein = totalVitamins - (carbos + calcium);
                let newEff = this.calcBreedingEfficiency([protein, calcium, carbos]);
                if (newEff > eff) {
                    eff = newEff;
                    optimalVitamins = [protein, calcium, carbos];
                }
            }
        }
        // Optimally use vitamins
        GameHelper.enumNumbers(GameConstants.VitaminType).forEach((v) => {
            if (this.vitaminsUsed[v]()) {
                this.removeVitamin(v, Infinity);
            }
            if (v < optimalVitamins.length && optimalVitamins[v] > 0) {
                this.useVitamin(v, optimalVitamins[v]);
            }
        });
    }
}

wildPokeNameDisabled(loadSetting('wildPokeNameDisabled', false));
wildPokeDefeatDisabled(loadSetting('wildPokeDefeatDisabled', false));
wildPokeImgDisabled(loadSetting('wildPokeImgDisabled', false));
wildPokeHealthDisabled(loadSetting('wildPokeHealthDisabled', false));
wildPokeCatchDisabled(loadSetting('wildPokeCatchDisabled', false));
avsDisableNotifications = loadSetting('avsDisableNotifications', false);

function loadSetting(key, defaultVal) {
    var val;
    try {
        val = JSON.parse(localStorage.getItem(key));
        if (val == null || typeof val !== typeof defaultVal) {
            throw new Error;
        }
    } catch {
        val = defaultVal;
        localStorage.setItem(key, defaultVal);
    }
    return val;
}

function loadScript(){
    const oldInit = Preload.hideSplashScreen;
    var hasInitialized = false;

    Preload.hideSplashScreen = function (...args) {
        var result = oldInit.apply(this, args)
        if (App.game && !hasInitialized) {
            initVisualSettings();
            hasInitialized = true;
        }
        return result;
    }

    addGraphicsBindings();
    addOptimizeVitamins();
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

if (!App.isUsingClient || localStorage.getItem(scriptName) === 'true') {
    loadScript();
}
