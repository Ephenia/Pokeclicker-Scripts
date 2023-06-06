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
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const settingsFile = path.join(dataDir, "settings.ini");
// Upstream scripts directory
const defaultScriptsDir = path.join(dataDir, "scripts");
// Custom scripts directory
const customScriptsDir = path.join(dataDir, "custom-scripts");

console.info("Data directory:", dataDir);

let checkForUpdatesInterval;
let newVersion = "0.0.0";
let currentVersion = "0.0.0";
let windowClosed = false;

let mainWindow;
let config;

function createWindow() {
  // Set the Application for Desktop notifications (windows only)
  try {
    app.setAppUserModelId("PokéClicker");
  } catch (e) {}

  if (fs.existsSync(settingsFile)) {
    getConfig();
  } else {
    config = { Sizing: { Width: "800", Height: "600", Maximized: false } };
    fs.writeFile(
      settingsFile,
      "[Sizing]\r\nWidth=800\r\nHeight=600\r\nMaximized=false",
      function () {}
    );
  }

  function getConfig() {
    config = ini.parse(fs.readFileSync(settingsFile, "utf-8"));
  }

  mainWindow = new BrowserWindow({
    icon: __dirname + "/icon.png",
    minWidth: 300,
    minHeight: 200,
    width: +config.Sizing.Width,
    height: +config.Sizing.Height,
    resizable: true,
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

      startEpheniaScripts();
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

  mainWindow.on("resize", function () {
    const size = mainWindow.getSize();
    const width = size[0];
    const height = size[1];
    config.Sizing.Width = width;
    config.Sizing.Height = height;
    config.Sizing.Maximized = mainWindow.isMaximized();
    fs.writeFileSync(settingsFile, ini.stringify(config));
  });
  mainWindow.on("close", (event) => {
    windowClosed = true;
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.on("page-title-updated", function (e) {
    e.preventDefault();
  });
  if (config.Sizing.Maximized) mainWindow.maximize();
}

function createSecondaryWindow() {
  let newWindow = new BrowserWindow({
    icon: __dirname + "/icon.png",
    minWidth: 300,
    minHeight: 200,
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

let customScripts = [];

function logInMainWindow(message, level = 'log') {
  if (message == null) {
    return;
  }
  message = message.replaceAll('`', '\\`').replaceAll('$', '\\$');
  mainWindow.webContents.executeJavaScript(`console.${level}(\`${message}\`);`)
  .catch((err) => (console.log(`Failed to log message:\n${message}\n\n${err}`)));
}

function runScript(scriptFilePath) {
  if (fs.existsSync(scriptFilePath)) {
    logInMainWindow(`Running ${scriptFilePath}`, 'debug');
    mainWindow.webContents
      .executeJavaScript(fs.readFileSync(scriptFilePath, "utf-8"))
      .catch((err) => {
        logInMainWindow(`Failed to run script '${scriptFilePath}':\n${err}`, 'error');
      });
  } else {
    logInMainWindow(`Tried to run nonexistent file '${scriptFilePath}'`, 'error')
  }
}

function runEpheniaScript(file) {
  const filePath = path.join(defaultScriptsDir, file);
  if (!customScripts.includes(file)) {
    runScript(filePath);
  } else {
    logInMainWindow(`Ignoring '${file}' as another script with this name is in '${customScriptsDir}'`);
  }
}

function ensureScriptsDirsExist() {
  if (!fs.existsSync(defaultScriptsDir)) {
    fs.mkdirSync(defaultScriptsDir, { recursive: true });
  }
  if (!fs.existsSync(customScriptsDir)) {
    fs.mkdirSync(customScriptsDir, { recursive: true });
  }
}

function getCustomScripts() {
  try {
    let files = fs.readdirSync(customScriptsDir);
    files = files.filter((f) => (f.includes('.js')));
    customScripts.push(...files);
  } catch (err) {
    logInMainWindow(`Unexpected issue reading custom-scripts directory:\n${err}`, 'error');
  }
}

function runCustomScripts() {
  logInMainWindow(`Running custom scripts`);
  customScripts.forEach((file) => {
    const filePath = path.join(customScriptsDir, file);
    runScript(filePath);
  });
}

function runScriptsOffline() {
  fs.readdir(defaultScriptsDir, (err, files) => {
    if (err) {
      logInMainWindow(`Unexpected issue reading scripts directory:\n${err}`, 'error');
      return;
    }
    files.forEach((file) => {
      if (file.includes(".js")) {
        runEpheniaScript(file);
      }
    });
  });
}

function getRepoContents(url) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status === 200) {
        let files = JSON.parse(request.responseText);
        files = files.filter((f) => (f.name.includes('.js')));
        files = files.map((f) => ([f.name, f.download_url]));
        resolve(files);
      } else {
        reject(`Failed to read repository contents (status code ${request.status})`);
      }
    }
    request.onerror = () => {
      reject(`Network request failed: could not read repository contents (status code ${request.status})`);
    }
    request.timeout = 5000;
    request.ontimeout = () => {
      reject(`Network request timed out: could not read repository contents (status code ${request.status})`);
    }
    request.open("get", url);
    request.send();
  });
}

function downloadScript(url) {
  // TODO download files directly to temp file?
  logInMainWindow(`Trying to download '${url}'`, 'debug')
  return new Promise((resolve, reject) => {
    var request = https.request(url, (res) => {
      logInMainWindow(`Recieved result for '${url}'`, 'debug');
      if (res.statusCode !== 200) {
        reject(`Failed to download file '${file}' from repository (status code ${res.statusCode})`);
      }
      res.setEncoding('utf-8');
      var data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        logInMainWindow(`Request ended for '${url}'`, 'debug');
        resolve(data);
      });
    });
    request.on('error', (err) => {
      reject(`Failed to download file '${file}' from repository:\n ${err.message}`);
    });
    request.setTimeout(5000, () => {
      reject(`Timed out while trying to download file '${file}' from repository`);
    });
    request.end();
  });
}

function downloadAndRunScript(fileinfo, delay) {
  return new Promise(async (resolve, reject) => {
    var [file, url] = fileinfo;
    const filePath = path.join(defaultScriptsDir, file);
    var dataNew;
    var dataOld;
    var status = 0; // -1 for download error, 0 for no change, 1 for update, 2 for new file

    // Don't make too many requests simultaneously
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Download file
    try {
      dataNew = await downloadScript(url);
    } catch (err) {
      logInMainWindow(err, 'error');
      dataNew = null;
      status = -1;
    }

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
      status = 2;
    }

    // If downloaded file differs, save it
    if (dataNew && dataNew !== dataOld) {
      if (dataOld != null) {
        status = 1;
      }
      try {
        logInMainWindow(`Writing file to '${filePath}'`, 'debug');
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
        return reject(`Failed to save downloaded file '${filePath}':\n${err}"`);
      }
    }

    // If there's a file to run, run it!
    if (dataNew || dataOld) {
      runEpheniaScript(file);
    }
    resolve(status);
  });
}

async function handleScripts(files) {
  const delay = 5; // time between requests in milliseconds
  var downloads = [];

  files.forEach((fileinfo, i) => {
    let download = downloadAndRunScript(fileinfo, i * delay);
    download.catch((err) => { logInMainWindow(err, 'error'); });
    downloads.push(download);

    // clean up old misnamed files
    try {
      let filePath = path.join(defaultScriptsDir, fileinfo[0].replace('.js', ''));
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath);
      }
    } catch (err) { 
      // do nothing
    }
  });

  var downloadStatuses = await Promise.allSettled(downloads);
  logInMainWindow('Finished downloading Ephenia scripts from repository');

  let failedDownloads = 0;
  let changedFiles = 0;
  let newFiles = 0;

  downloadStatuses.forEach((val) => {
    if (val.value == -1 || val.status == 'rejected') {
      failedDownloads += 1;
    } else if (val.value == 1) {
      changedFiles += 1;
    } else if (val.value == 2) {
      newFiles += 1;
    }
  });

  let message = '';
  if (failedDownloads) {
    message += `${failedDownloads} download${failedDownloads > 1 ? 's' : ''} failed\n`;
  }
  if (newFiles) {
    message += `${newFiles} new script${newFiles > 1 ? 's' : ''} downloaded\n`;
  }
  if (changedFiles) {
    message += `${changedFiles} script update${changedFiles > 1 ? 's' : ''} downloaded`;
  }

  if (message.length > 0) {
    mainWindow.webContents.executeJavaScript(`Notifier.notify({
      type: NotificationConstants.NotificationOption.${failedDownloads ? 'warning' : 'info'},
      title: 'Pokéclicker Scripts Desktop',
      message: '${message.trim()}',
      timeout: GameConstants.HOUR,
    });`);
  }
}

function startEpheniaScripts() {
  runScript(`${__dirname}/scripthandler.js`);
  ensureScriptsDirsExist();
  getCustomScripts();

  const repoUrl = 'https://api.github.com/repos/Ephenia/Pokeclicker-Scripts/contents/';
  var files;

  getRepoContents(repoUrl)
    .then((data) => {
      files = data;
      return getRepoContents(repoUrl + 'custom');
    }, (err) => {
      throw err;
    })
    .then((data) => {
      files = files.concat(data);
      logInMainWindow(`Found script files in Ephenia/Pokeclicker-Scripts/ github repository:\n${files.map(f => f[0]).join('\n')}`, 'debug');
      handleScripts(files);
    }, (err) => { 
      logInMainWindow(err, 'warn');
      logInMainWindow('Could not connect to Ephenia GitHub repository, running scripts offline');
      runScriptsOffline();
    });

  runCustomScripts();
}

