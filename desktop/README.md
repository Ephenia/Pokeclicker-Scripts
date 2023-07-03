# Pokéclicker Scripts Desktop

A version of the PokéClicker desktop client modified to manage and run userscripts.

## Features:
- Automatically downloads new scripts and script versions from this project
- Runs offline after initial script downloads
- Enable and disable individual scripts
- Supports adding your own userscripts

## Instructions:

1. Download the latest version of the Pokéclicker desktop client from [https://github.com/RedSparr0w/Pokeclicker-desktop/releases/](https://github.com/RedSparr0w/Pokeclicker-desktop/releases/) and make sure the game runs properly. 
2. Download the `app.asar` file from this folder
3. Where you installed the PokéClicker app, locate its `resources` folder. This step will depend on your operating system: `resources` may be in the same folder as the app, or inside the app's package contents itself.
4. There should be an `app.asar` file already inside the `resources` folder. Replace it with the modified `app.asar` downloaded here.
5. Open the PokéClicker app again. It should automatically download the scripts from this GitHub repository.
6. Load a save and open the game's settings.
7. In the settings menu, there should be a tab to the far right called "Scripts" that lists all of the installed scripts. (Some settings from enabled scripts will appear here as well.) Newly-downloaded scripts start out disabled; enable any that you want to use.
8. Restart the app and enjoy using the scripts!

<img width="840" alt="Script manager options" src="https://github.com/Ephenia/Pokeclicker-Scripts/assets/12092270/dc19411e-c565-48cb-8be6-6ac9b8abe17b">

Optionally, you can add custom scripts from outside this project. This mod creates two new folders in the app's application data directory, `scripts` and `custom-scripts`. JavaScript (`.js`) files placed in the `custom-scripts` folder will run when the app is launched, and like other scripts can be disabled/enabled in the settings. The application data location depends on operating system:

- Windows: `%APPDATA%/pokeclicker-desktop`
- macOS: `~/Library/Application Support/pokeclicker-desktop`
- Linux: either `$XDG_CONFIG_HOME/pokeclicker-desktop` or `~/.config/pokeclicker-desktop`

You can now also disable automatic downloading of new script versions. This is only recommended for advanced users who want to modify scripts or update to in-development script versions before their official release. In this mode, the client will notify you when updates to scripts are available. You can either automatically download all updates via an option in the settings menu, or manually install individual updates. For manual installation, download the desired script file from this repository, save it in the `scripts` folder, and launch the game once before making any modifications to the script.