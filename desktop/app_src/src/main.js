"use strict";

/* eslint-disable no-console */

const { autoUpdater } = require("electron-updater");
const { app, BrowserWindow, dialog } = require("electron");
const DiscordRPC = require("discord-rpc");
const https = require("https");
const fs = require("fs");
const Zip = require("adm-zip");
const electron = require("electron");
const clientVersion = app.getVersion();

const dataDir = (electron.app || electron.remote.app).getPath("userData");

// Used for Ephenia scripts
const path = require("path");
const url = require("url");
const ini = require("ini");
const { XMLHttpRequest } = require("xmlhttprequest");
const { createHash } = require('crypto');
const semver = require('semver');


const settingsFile = path.join(dataDir, "settings.ini");
// Upstream scripts directory
const defaultScriptsDir = path.join(dataDir, "scripts");
// Custom scripts directory
const customScriptsDir = path.join(dataDir, "custom-scripts");
// Script checksums file for update checking
const checksumsFile = path.join(defaultScriptsDir, "fileVersions.json");
// Client's Electron version when this desktop scripts version was made
const MOD_EXPECTED_CLIENT_VERSION = '1.2.0';
// Used for update checking as the real client version gets overridden by the mod
const MOD_EXPECTED_ELECTRON_VERSION = '^21.3.1';
// VERY IMPORTANT: update this in desktopupdatechecker.js as well!
const POKECLICKER_SCRIPTS_DESKTOP_VERSION = '2.1.0';

console.info("Data directory:", dataDir);

let checkForUpdatesInterval;
let newVersion = "0.0.0";
let currentVersion = "0.0.0";
let windowClosed = false;

let mainWindow;

/* DESKTOP SCRIPTS ADDITION */

let config;
let minWindowWidth = 300;
let minWindowHeight = 200;

if (fs.existsSync(settingsFile)) {
  config = ini.parse(fs.readFileSync(settingsFile, "utf-8"));
} 
if (!(config?.Sizing 
    && +config.Sizing.Width > minWindowWidth
    && +config.Sizing.Height > minWindowHeight
    && typeof config.Sizing.Maximized === 'boolean'
  )) {
  config = { Sizing: { Width: "800", Height: "600", Maximized: false } };
  fs.writeFile(
    settingsFile,
    "[Sizing]\r\nWidth=800\r\nHeight=600\r\nMaximized=false",
    () => {},
  );
}

/* END DESKTOP SCRIPTS ADDITION */

function createWindow() {
  // Set the Application for Desktop notifications (windows only)
  try {
    app.setAppUserModelId("PokéClicker");
  } catch (e) {}

  mainWindow = new BrowserWindow({
    icon: __dirname + "/icon.png",
    minWidth: minWindowWidth,
    minHeight: minWindowHeight,
    width: +config.Sizing.Width,    // DESKTOP SCRIPTS ADDITION
    height: +config.Sizing.Height,  // DESKTOP SCRIPTS ADDITION
    resizable: true,                // DESKTOP SCRIPTS ADDITION
    webPreferences: {
      webSecurity: false,
      backgroundThrottling: false,
    },
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents
      .executeJavaScript(
        `(() => { DiscordRichPresence.clientVersion = '${clientVersion}' })()`
      )
      .catch((e) => {});
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.setTitle("PokéClicker");

  // Check if we've already downloaded the data, otherwise load our loading screen
  if (fs.existsSync(`${dataDir}/pokeclicker-master/docs/index.html`)) {
    mainWindow.loadURL(`file://${dataDir}/pokeclicker-master/docs/index.html`);
  } else {
    mainWindow.loadURL(
      `file://${__dirname}/pokeclicker-master/docs/index.html`
    );
  }

  injectDesktopScriptsModifications(mainWindow); // DESKTOP SCRIPTS ADDITION

  mainWindow.on("close", (event) => {
    windowClosed = true;
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.on("page-title-updated", function (e) {
    e.preventDefault();
  });
}

function createSecondaryWindow() {
  let newWindow = new BrowserWindow({
    icon: __dirname + "/icon.png",
    minWidth: minWindowWidth,
    minHeight: minWindowHeight,
    width: +config.Sizing.Width,    // DESKTOP SCRIPTS ADDITION
    height: +config.Sizing.Height,   // DESKTOP SCRIPTS ADDITION
    resizable: true,                // DESKTOP SCRIPTS ADDITION
    webPreferences: {
      webSecurity: false,
      backgroundThrottling: false,
    },
  });

  newWindow.setMenuBarVisibility(false);
  newWindow.setTitle("PokéClicker (alternate)");

  // Check if we've already downloaded the data, otherwise load our loading screen
  if (fs.existsSync(`${dataDir}/pokeclicker-master/docs/index.html`)) {
    newWindow.loadURL(`file://${dataDir}/pokeclicker-master/docs/index.html`);
  } else {
    newWindow.loadURL(`file://${__dirname}/pokeclicker-master/docs/index.html`);
  }

  injectDesktopScriptsModifications(newWindow); // DESKTOP SCRIPTS ADDITION

  newWindow.on("close", (event) => {
    newWindow = true;
  });
  newWindow.on("closed", () => {
    newWindow = null;
  });
  newWindow.on("page-title-updated", function (e) {
    e.preventDefault();
  });
  return newWindow;
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/*
DISCORD STUFF
*/

const isMainInstance = app.requestSingleInstanceLock();

if (!isMainInstance) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }

    createSecondaryWindow();
  });

  // Set this to your Client ID.
  const clientId = "733927271726841887";

  // Only needed if you want to use spectate, join, or ask to join
  DiscordRPC.register(clientId);

  const rpc = new DiscordRPC.Client({ transport: "ipc" });

  async function setActivity() {
    if (!rpc || !mainWindow) {
      return;
    }

    let discordData = {};

    try {
      discordData = await mainWindow.webContents.executeJavaScript(
        "DiscordRichPresence.getRichPresenceData()"
      );
    } catch (e) {
      console.warn("Something went wrong, could not gather discord RP data");
    }

    if (!discordData.enabled) {
      return rpc.clearActivity();
    }

    // You'll need to have image assets uploaded to
    // https://discord.com/developers/applications/<application_id>/rich-presence/assets
    const activity = {
      instance: true,
    };
    activity.details =
      discordData.line1?.length <= 1 ? "--" : discordData.line1.substr(0, 128);
    activity.state =
      discordData.line2?.length <= 1 ? "--" : discordData.line2.substr(0, 128);
    if (discordData.startTimestamp)
      activity.startTimestamp = discordData.startTimestamp;
    if (discordData.largeImageKey)
      activity.largeImageKey = discordData.largeImageKey;
    if (discordData.largeImageKey && discordData.largeImageText)
      activity.largeImageText = discordData.largeImageText.substr(0, 128);
    if (discordData.smallImageKey)
      activity.smallImageKey = discordData.smallImageKey;
    if (discordData.smallImageKey && discordData.smallImageText)
      activity.smallImageText = discordData.smallImageText.substr(0, 128);

    rpc.setActivity(activity);
  }

  rpc.on("ready", () => {
    setActivity();

    // activity can only be set every 15 seconds
    setInterval(() => {
      setActivity();
    }, 15e3);
  });

  rpc.login({ clientId }).catch(console.error);

  /*
  UPDATE STUFF
  */
  const isNewerVersion = (version) => {
    return (
      version.localeCompare(currentVersion, undefined, { numeric: true }) === 1
    );
  };

  const downloadUpdate = async (initial = false) => {
    const zipFilePath = `${dataDir}/update.zip`;
    const file = fs.createWriteStream(zipFilePath);
    https
      .get(
        "https://codeload.github.com/pokeclicker/pokeclicker/zip/master",
        async (res) => {
          let cur = 0;
          try {
            if (!initial)
              await mainWindow.webContents.executeJavaScript(
                `Notifier.notify({ title: '[UPDATER] v${newVersion}', message: 'Downloading Files...<br/><span id="update-message-progress">Please Wait...</span>', timeout: 1e6 })`
              );
          } catch (e) {}

          res.on("data", async (chunk) => {
            cur += chunk.length;
            try {
              if (initial)
                await mainWindow.webContents.executeJavaScript(
                  `setStatus("Downloading Files...<br/>${(
                    cur / 1048576
                  ).toFixed(2)} mb")`
                );
              else
                await mainWindow.webContents.executeJavaScript(
                  `document.getElementById('update-message-progress').innerText = "${(
                    cur / 1048576
                  ).toFixed(2)} mb"`
                );
            } catch (e) {}
          });

          res.pipe(file).on("finish", async () => {
            try {
              if (initial)
                await mainWindow.webContents.executeJavaScript(
                  'setStatus("Files Downloaded!<br/>Extracting Files...")'
                );
              else
                await mainWindow.webContents.executeJavaScript(
                  `Notifier.notify({ title: '[UPDATER] v${newVersion}', message: 'Files Downloaded!<br/>Extracting Files...', timeout: 2e4 })`
                );
            } catch (e) {}

            const zip = new Zip(zipFilePath);

            const extracted = zip.extractEntryTo(
              "pokeclicker-master/docs/",
              `${dataDir}`,
              true,
              true
            );

            fs.unlinkSync(zipFilePath);

            if (!extracted) {
              return downloadUpdateFailed();
            }

            currentVersion = newVersion;
            startUpdateCheckInterval();

            // If this is the initial download, don't ask the user about refreshing the page
            if (initial) {
              mainWindow.loadURL(
                `file://${dataDir}/pokeclicker-master/docs/index.html`
              );
              return;
            }

            const userResponse = dialog.showMessageBoxSync(mainWindow, {
              title: "PokeClicker - Update success!",
              message: `Successfully updated,\nwould you like to reload the page now?`,
              icon: `${__dirname}/icon.png`,
              buttons: ["Yes", "No"],
              noLink: true,
            });

            if (userResponse == 0) {
              mainWindow.loadURL(
                `file://${dataDir}/pokeclicker-master/docs/index.html`
              );
            }
          });
        }
      )
      .on("error", (e) => {
        return downloadUpdateFailed();
      });
  };

  const downloadUpdateFailed = () => {
    // If client exe updating, return
    if (windowClosed) return;

    const userResponse = dialog.showMessageBoxSync(mainWindow, {
      type: "error",
      title: "PokeClicker - Update failed!",
      message: `Failed to download or extract the update,\nWould you like to retry?`,
      icon: `${__dirname}/icon.png`,
      buttons: ["Yes", "No"],
      noLink: true,
    });

    if (userResponse == 0) {
      downloadUpdate();
    }
  };

  const checkForUpdates = () => {
    const request = https
      .get(
        "https://raw.githubusercontent.com/pokeclicker/pokeclicker/master/package.json",
        (res) => {
          let body = "";

          res.on("data", (d) => {
            body += d;
          });

          res.on("end", () => {
            let data = { version: "0.0.0" };
            try {
              data = JSON.parse(body);
              newVersion = data.version;
              const newVersionAvailable = isNewerVersion(data.version);

              if (newVersionAvailable) {
                // Stop checking for updates
                clearInterval(checkForUpdatesInterval);
                // Check if user want's to update now
                shouldUpdateNowCheck();
              }
            } catch (e) {}
          });
        }
      )
      .on("error", (e) => {
        // TODO: Update download failed
        console.warn("Couldn't check for updated version, might be offline..");
      });
  };

  const shouldUpdateNowCheck = () => {
    const userResponse = dialog.showMessageBoxSync(mainWindow, {
      title: "PokeClicker - Update available!",
      message: `There is a new update available (v${newVersion}),\nWould you like to download it now?\n\n`,
      icon: `${__dirname}/icon.png`,
      buttons: ["Update Now", "Remind Me", "No (disable check)"],
      noLink: true,
    });

    switch (userResponse) {
      case 0:
        downloadUpdate();
        break;
      case 1:
        // Check again in 1 hour
        setTimeout(shouldUpdateNowCheck, 36e5);
        break;
      case 2:
        console.info("Update check disabled, stop checking for updates");
        break;
    }
  };

  const startUpdateCheckInterval = (run_now = false) => {
    // Check for updates every hour
    checkForUpdatesInterval = setInterval(checkForUpdates, 36e5);
    if (run_now) checkForUpdates();
  };

  try {
    // If we can get our current version, start checking for updates once the game starts
    currentVersion = JSON.parse(
      fs
        .readFileSync(`${dataDir}/pokeclicker-master/docs/package.json`)
        .toString()
    ).version;
    if (currentVersion == "0.0.0")
      throw Error("Must re-download updated version");
    setTimeout(() => {
      startUpdateCheckInterval(true);
    }, 1e4);
  } catch (e) {
    // Game not downloaded yet
    downloadUpdate(true);
    console.log("downloading...");
  }

  try {
    autoUpdater.on("update-downloaded", () => {
      const userResponse = dialog.showMessageBoxSync(mainWindow, {
        title: "PokeClicker - Client Update Available!",
        message: `There is a new client update available,\nWould you like to install it now?\n\n`,
        icon: `${__dirname}/icon.png`,
        buttons: ["Restart App Now", "Later"],
        noLink: true,
      });

      switch (userResponse) {
        case 0:
          windowClosed = true;
          autoUpdater.quitAndInstall(true, true);
          break;
      }
    });
    autoUpdater.checkForUpdatesAndNotify();
  } catch (e) {}
}


/*
Ephenia scripts loading
*/

// Run all the desktop scripts code separately for each game window
function injectDesktopScriptsModifications(gameWindow) {
  
  // Script-handling loading triggers
  gameWindow.webContents.on('dom-ready', () => {
    delayGameLoadUntilScriptsReady();
  });
  gameWindow.webContents.on('did-finish-load', () => {
    startEpheniaScripts();
  });

  // Resizable game window
  gameWindow.on('resize', function () {
    const size = gameWindow.getSize();
    const width = size[0];
    const height = size[1];
    config.Sizing.Width = width;
    config.Sizing.Height = height;
    config.Sizing.Maximized = gameWindow.isMaximized();
    fs.writeFileSync(settingsFile, ini.stringify(config));
  });
  if (config.Sizing.Maximized) {
    gameWindow.maximize();
  }


  function logInGameWindow(message, level = 'log') {
    if (message == null) {
      return;
    }
    message = String(message).replaceAll('`', '\\`').replaceAll('$', '\\$');
    gameWindow.webContents.executeJavaScript(`console.${level}(\`${message}\`);`)
    .catch((err) => {
      console.log(`Failed to log message:\n${message}\n\n${err}`) 
    });
  }

  function runScript(scriptFilePath) {
    return new Promise((resolve) => {
      if (fs.existsSync(scriptFilePath)) {
        logInGameWindow(`Running ${scriptFilePath}`, 'debug');
        gameWindow.webContents
          .executeJavaScript(fs.readFileSync(scriptFilePath, 'utf-8') + ';0')
          .catch((err) => {
            logInGameWindow(`Issue running script '${scriptFilePath}':\n${err}`, 'error');
          })
          .finally(() => resolve());
      } else {
        logInGameWindow(`Tried to run nonexistent file '${scriptFilePath}'`, 'error');
        resolve();
      }
    });
  }

  function runEpheniaScript(file) {
    return new Promise((resolve) => {
      const filePath = path.join(defaultScriptsDir, file);
      // Hard-coded exception to guarantee users are notified of updates
      if (file === 'desktopupdatechecker.js') {
        runScript(filePath)
          .then(() => resolve());
        return;
      }
      const name = file.substring(0, file.indexOf('.'));
      // Only run script if it is enabled
      gameWindow.webContents.executeJavaScript(`DesktopScriptHandler.isEpheniaScriptEnabled('${name}');`)
        .then((res) => {
          if (res) {
            return runScript(filePath);
          }
        })
        .finally(() => resolve());
      // Add script toggle to desktop settings
      gameWindow.webContents.executeJavaScript(`DesktopScriptHandler.registerEpheniaScript('${name}');`);
    });
  }

  function ensureScriptsDirsExist() {
    if (!fs.existsSync(defaultScriptsDir)) {
      fs.mkdirSync(defaultScriptsDir, { recursive: true });
    }
    if (!fs.existsSync(customScriptsDir)) {
      fs.mkdirSync(customScriptsDir, { recursive: true });
    }
    if (!fs.existsSync(checksumsFile)) {
      fs.writeFileSync(checksumsFile, '{}', 'utf-8');
    }
  }

  function getCustomScripts() {
    try {
      let files = fs.readdirSync(customScriptsDir);
      return files.filter((f) => (f.endsWith('.js')));
    } catch (err) {
      logInGameWindow(`Unexpected issue reading custom-scripts directory:\n${err}`, 'error');
      return [];
    }
  }

  function runCustomScripts() {
    return new Promise((resolve) => {
      var customScripts = getCustomScripts();
      if (customScripts.length) {
        logInGameWindow(`Running user-added scripts`);
      } else {
        logInGameWindow(`No user-added scripts found`);
      }
      var scriptsExecuted = [];
      customScripts.forEach((file) => {
        const filePath = path.join(customScriptsDir, file);
        const name = file.substring(0, file.indexOf('.'));
        // Only run script if it is enabled
        let running = gameWindow.webContents.executeJavaScript(`DesktopScriptHandler.isUserScriptEnabled('${name}');`)
          .then((res) => {
            if (res) {
              return runScript(filePath);
            }
          });
        scriptsExecuted.push(running);
        // Add script toggle to desktop settings
        gameWindow.webContents.executeJavaScript(`DesktopScriptHandler.registerUserScript('${name}');`);
      });
      Promise.allSettled(scriptsExecuted)
        .then(() => resolve());
    });
  }

  function getRepoContents(url) {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.onload = () => {
        if (request.status === 200) {
          let files = JSON.parse(request.responseText);
          files = files.filter((f) => (f.name.endsWith('.js')));
          files = files.map((f) => ([f.name, f.download_url]));
          resolve(files);
        } else {
          reject(`Failed to read repository contents (status code ${request.status})`);
        }
      }
      request.onerror = () => {
        reject(`Network request failed: could not read repository contents (status code ${request.status})`);
      }
      request.timeout = 10000;
      request.ontimeout = () => {
        reject(`Network request timed out: could not read repository contents (status code ${request.status})`);
      }
      request.open("get", url);
      request.send();
    });
  }

  function downloadScript(url, file) {
    // TODO download files directly to temp file?
    logInGameWindow(`Trying to download '${url}'`, 'debug')
    return new Promise((resolve, reject) => {
      var request = https.request(url, (res) => {
        logInGameWindow(`Recieved result for '${url}'`, 'debug');
        if (res.statusCode !== 200) {
          reject(`Failed to download file '${file}' from repository (status code ${res.statusCode})`);
        }
        res.setEncoding('utf-8');
        var data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      });
      request.on('error', (err) => {
        reject(`Failed to download file '${file}' from repository:\n ${err.message}`);
      });
      request.setTimeout(10000, () => {
        reject(`Timed out while trying to download file '${file}' from repository`);
      });
      request.end();
    });
  }

  function downloadAndRunScript(fileinfo, delay, checksumOld, installUpdate) {
    return new Promise(async (resolve, reject) => {
      var [file, url] = fileinfo;
      const filePath = path.join(defaultScriptsDir, file);
      var dataOld;
      var dataNew;
      var checksumNew;
      // Statuses: -1 for download error, 0 for no change, 1 for update available, 2 for update downloaded, 3 for new file
      var resolveData = {
        'filename': file,
        'scriptname': file.substring(0, file.indexOf('.')),
        'status': 0,
        'checksum': checksumOld,
      };

      // Don't make too many requests simultaneously
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Read old file, if it exists
      if (fs.existsSync(filePath)) {
        try {
          dataOld = await new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf-8', (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
          });
        } catch (err) {
          return reject(`Unable to read existing script file '${filePath}:\n${err}`);
        }
      } else {
        dataOld = null;
        checksumOld = null;
      }

      // Download file
      try {
        dataNew = await downloadScript(url, file);
        checksumNew = createHash('md5').update(dataNew).digest('hex');
      } catch (err) {
        logInGameWindow(err, 'error');
        dataNew = null;
        resolveData.status = -1;
      }

      // Check if remote version of the file has been updated
      if (dataNew && checksumOld !== checksumNew) {
        if (dataOld == dataNew) {
          // File hasn't actually changed but the checksum doesn't match, silently update it
          resolveData.status = 0;
          resolveData.checksum = checksumNew;
        } else if (installUpdate || dataOld == null || checksumOld == null) {
          // Updating is enabled, or newly-encountered file takes priority
          if (dataOld == null) {
            // New script
            resolveData.status = 3;
          } else {
            // Script update
            resolveData.status = 2;
          }
          resolveData.checksum = checksumNew;
          try {
            logInGameWindow(`Saving downloaded script file to '${filePath}'`, 'debug');
            await new Promise((resolve, reject) => {
              fs.writeFile(filePath, dataNew, 'utf-8', (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          } catch (err) {
            return reject(`Failed to save downloaded file '${filePath}:\n${err}'`);
          }
        } else {
          // Update available but updating disabled
          resolveData.status = 1;
        }
      }

      // If there's a file to run, run it!
      if (dataNew || dataOld) {
        runEpheniaScript(file)
          .finally(() => resolve(resolveData));
      } else {
        reject(`Unknown error while downloading/running '${file}' script`);
      }
    });
  }

  function handleScripts(files) {
    return new Promise(async (resolve) => {
      const delay = 5; // time between requests in milliseconds
      var downloads = [];

      var shouldScriptsAutoUpdate = await gameWindow.webContents.executeJavaScript(`DesktopScriptHandler.shouldScriptsAutoUpdate();`);

      // Load checksums for update checking
      var scriptChecksums;
      try {
        scriptChecksums = JSON.parse(fs.readFileSync(checksumsFile, 'utf-8'));
      } catch (err) {
        scriptChecksums = {};
      }
      
      // Download and run files
      files.forEach((fileinfo, i) => {
        let filename = fileinfo[0];
        let download = downloadAndRunScript(fileinfo, i * delay, scriptChecksums[filename], shouldScriptsAutoUpdate);
        download.catch((err) => {
          const filePath = path.join(defaultScriptsDir, filename);
          logInGameWindow(err, 'error'); 
          fs.unlink(filePath, (err) => { }); // just in case there's file corruption
        });
        downloads.push(download);
      });

      var downloadResults = await Promise.allSettled(downloads);
      logInGameWindow('Finished downloading Ephenia scripts from repository');

      // Save checksum data for script update checking
      var updatedChecksums = {};
      downloadResults.filter((res) => (res.status == 'fulfilled')).forEach((res) => {
        updatedChecksums[res.value.filename] = res.value.checksum;
      });
      fs.writeFile(checksumsFile, JSON.stringify(updatedChecksums), 'utf-8', (err) => {
        if (err) {
          logInGameWindow(`Unable to save script checksums file!\n${err}`);
        } else {
          logInGameWindow('Saved script checksums file successfully', 'debug');
        }
      });

      // Notify user about results of script updating
      let failedDownloads = downloadResults.filter((res) => (res.status == 'rejected' || res.value.status == -1));
      let updatesAvailable = downloadResults.filter((res) => (res.value?.status == 1)).map((res) => res.value.scriptname);
      let changedFiles = downloadResults.filter((res) => (res.value?.status == 2)).map((res) => res.value.scriptname);
      let newFiles = downloadResults.filter((res) => (res.value?.status == 3)).map((res) => res.value.scriptname);

      if (failedDownloads.length) {
        gameWindow.webContents.executeJavaScript(`Notifier.notify({
          type: NotificationConstants.NotificationOption.warning,
          title: 'Pokéclicker Scripts Desktop',
          message: '${failedDownloads.length} downloads failed',
          timeout: GameConstants.HOUR,
        });`);
      }

      let message = [];
      if (newFiles.length) {
        message.push(`${newFiles.length} new script${newFiles.length != 1 ? 's' : ''} downloaded:\n` + newFiles.join('\n'));
      }
      if (changedFiles.length) {
        message.push(`${changedFiles.length} script update${changedFiles.length != 1 ? 's' : ''} downloaded:\n` + changedFiles.join('\n'));
      }
      if (updatesAvailable.length) {
        message.push(`${updatesAvailable.length} script update${updatesAvailable.length != 1 ? 's' : ''} available:\n` + updatesAvailable.join('\n'));
      }

      if (message.length > 0) {
        gameWindow.webContents.executeJavaScript(`Notifier.notify({
          type: NotificationConstants.NotificationOption.info,
          title: 'Pokéclicker Scripts Desktop',
          message: \`${message.join('\n\n')}\`,
          timeout: GameConstants.HOUR,
        });`);
      }

      // True if any download/update messages were displayed
      resolve((failedDownloads.length || message.length) > 0);
    });
  }

  // Disable any files not found online (in case of script renames, etc)
  function disableExtraneousScripts(localFiles, repoFilenames) {
    let filesToDisable = localFiles.filter((file) => (!repoFilenames.includes(file)));
    filesToDisable.forEach((file) => {
      try {
        let oldPath = path.join(defaultScriptsDir, file);
        let newPath = path.join(defaultScriptsDir, file + '.disabled');
        fs.renameSync(oldPath, newPath);
      } catch (err) {
        logInGameWindow(err, 'error');
      }
    });
  }

  function delayGameLoadUntilScriptsReady() {
    // Prevent game loading before all scripts have been loaded, and notify the user if this causes a delay 
    gameWindow.webContents.executeJavaScript(`const resolveDesktopScriptsDone = (() => {
      // Promise for script downloads and execution finished
      var resolveScriptsDone;
      var waitingForScripts = true;
      var notifiedWaiting = false;
      const allScriptsDone = new Promise((resolve, reject) => {
        resolveScriptsDone = resolve;
      });
      allScriptsDone.then((res) => {
        if (notifiedWaiting && res != 'silent') {
          notifyScriptsDone(res);
        }
        waitingForScripts = false;
      });
      // Promise for player starting to load the game
      var resolveAppStartCalled;
      const appStartCalled = new Promise((resolve, reject) => {
        resolveAppStartCalled = resolve;
      });
      // Status notifications for the player in case there's a long delay
      const notifyScriptsDelay = () => {
        Notifier.notify({
          type: NotificationConstants.NotificationOption.info,
          title: 'Pokéclicker Scripts Desktop',
          message: 'Checking for userscript updates...',
          timeout: GameConstants.SECOND * 10,
        });
        notifiedWaiting = true;
      };
      const notifyScriptsDone = (res) => {
        Notifier.notify({
          type: NotificationConstants.NotificationOption[res === 'online' ? 'info' : 'warning'],
          title: 'Pokéclicker Scripts Desktop',
          message: (res === 'online' ? 'Done checking for updates.' : 'Unable to connect to GitHub, running offline'),
          timeout: GameConstants.SECOND * 10,
        });
      };
      // Intercept App.start()
      const startApp = App.start.bind(App);
      App.start = function start(...args) {
        if (waitingForScripts) {
          setTimeout(() => {
            if (waitingForScripts) {
              notifyScriptsDelay();
            }
          }, 200);
        }
        resolveAppStartCalled(args);
      }
      // Start app for real once scripts and player are both ready
      Promise.allSettled([appStartCalled, allScriptsDone]).then((res) => {
        startApp(...res[0].value); // res[0].value is the args passed to App.start()
      });
      // Lets the script loader resolve the promise externally 
      return resolveScriptsDone;
    })();`);
  }

  function startEpheniaScripts() {
    logInGameWindow(`Pokéclicker Scripts Desktop v${POKECLICKER_SCRIPTS_DESKTOP_VERSION} initializing!`);
    gameWindow.webContents.executeJavaScript(`const POKECLICKER_SCRIPTS_DESKTOP_VERSION = '${POKECLICKER_SCRIPTS_DESKTOP_VERSION}';`);

    // Warn user if desktop client is the wrong version
    // This isn't a perfect solution as a client update could leave the Electron version unchanged, but it's the best we can do for now
    if (!semver.satisfies(process.versions.electron, MOD_EXPECTED_ELECTRON_VERSION)) {
      const clientNewer = semver.gtr(process.versions.electron, MOD_EXPECTED_ELECTRON_VERSION);
      gameWindow.webContents.executeJavaScript(`Notifier.notify({
        type: NotificationConstants.NotificationOption.warning,
        title: 'Pokéclicker Scripts Desktop',
        message: '${clientNewer ? 'WARNING: You are using a newer desktop client version than Pokéclicker Scripts Desktop expects. This may cause bugs and unexpected behavior.'
          : `You are using an outdated desktop client version. Please install version ${MOD_EXPECTED_CLIENT_VERSION} to ensure all scripts work correctly.`}',
        timeout: GameConstants.DAY,
      });`);
    }

    runScript(`${__dirname}/scripthandler.js`);
    ensureScriptsDirsExist();

    const repoUrl = 'https://api.github.com/repos/Ephenia/Pokeclicker-Scripts/contents/';
    var repoFiles;
    var localFiles;
    var runningOffline = false;

    try {
      localFiles = fs.readdirSync(defaultScriptsDir);
      // Clean up old misnamed files
      let malformed = localFiles.filter((file) => file.endsWith('.user'));
      malformed.forEach((file) => {
        let oldPath = path.join(defaultScriptsDir, file);
        let newPath = path.join(defaultScriptsDir, file + '.js');
        fs.renameSync(oldPath, newPath);
        localFiles[localFiles.indexOf(file)] += '.js';
      });
      localFiles = localFiles.filter((file) => file.endsWith('.js'));
    } catch (err) {
      logInGameWindow(`Unexpected issue accessing scripts directory, aborting Pokéclicker Scripts Desktop`, 'error');
      logInGameWindow(err, 'error');
      return;
    }

    let epheniaScriptsDone = getRepoContents(repoUrl)
      .then((data) => {
        repoFiles = data;
        return getRepoContents(repoUrl + 'custom');
      }, (err) => {
        throw err;
      })
      .then((data) => {
        repoFiles = repoFiles.concat(data);
        let repoFilenames = repoFiles.map(f => f[0]);
        logInGameWindow(`Found script files in Ephenia/Pokeclicker-Scripts/ github repository:\n${repoFilenames.join('\n')}`, 'debug');
        let scriptsExecuted = handleScripts(repoFiles);
        disableExtraneousScripts(localFiles, repoFilenames);
        return scriptsExecuted;
      }, (err) => { 
        runningOffline = true;
        logInGameWindow(err, 'warn');
        logInGameWindow('Could not connect to Ephenia GitHub repository, running scripts offline');
        let scriptsExecutedOffline = [];
        localFiles.forEach((file) => {
          let scriptRan = runEpheniaScript(file);
          scriptsExecutedOffline.push(scriptRan);
        });
        return Promise.allSettled(scriptsExecutedOffline);
      });

    let customScriptsDone = runCustomScripts();

    // Allow game to load
    Promise.allSettled([epheniaScriptsDone, customScriptsDone])
      .then(async (res) => {
        const notifyResult = runningOffline ? 'offline' : (await epheniaScriptsDone ? 'silent' : 'online');
        gameWindow.webContents.executeJavaScript(`resolveDesktopScriptsDone('${notifyResult}');`);
      });
  }

}