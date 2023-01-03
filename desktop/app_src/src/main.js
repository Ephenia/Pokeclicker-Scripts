"use strict";

/* eslint-disable no-console */

const { autoUpdater } = require("electron-updater");
const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const url = require("url");
const DiscordRPC = require("discord-rpc");
const https = require("https");
const fs = require("fs");
const ini = require("ini");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Zip = require("adm-zip");
const electron = require("electron");
const clientVersion = app.getVersion();

const dataDir = (electron.app || electron.remote.app).getPath("userData");

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

  if (fs.existsSync(`settings.ini`)) {
    getConfig();
  } else {
    config = { Sizing: { Width: "800", Height: "600", Maximized: false } };
    fs.writeFile(
      "settings.ini",
      "[Sizing]\r\nWidth=800\r\nHeight=600\r\nMaximized=false",
      function () {}
    );
  }

  function getConfig() {
    config = ini.parse(fs.readFileSync("settings.ini", "utf-8"));
    //fs.writeFile("output.txt", JSON.stringify(config), function () {});
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
    mainWindow.webContents
      .executeJavaScript(
        fs.readFileSync(`${__dirname}/scripthandler.js`).toString()
      )
      .catch((e) => {});
    //List of custom scripts file names
    var cScripts = [];
    //pokeclicker-desktop/resources
    const directory = `${__dirname}/../../`;
    //pokeclicker-desktop/resources/scripts
    const dirScript = `${__dirname}/../../scripts`;
    //Creates scripts folder if non existant
    if (!fs.existsSync(dirScript)) {
      fs.mkdirSync(dirScript, { recursive: true });
    } else {
      //Gets list of custom scripts
      fs.readdir(dirScript, (err, files) => {
        files.forEach((file) => {
          if (file.includes(".js")) {
            // mainWindow.webContents.executeJavaScript(
            //   fs.readFileSync(`${__dirname}/../../${file}`).toString()
            // ).catch(e => { });
            cScripts.push(file.replace(/.js/g, ""));
            //fs.appendFileSync(`${__dirname}/../../scripts/filelist.txt`, `\r\n${file.replace(/.js/g, "")}`, 'utf-8');
          }
        });
      });
    }

    var reqInc = 0;
    var filePre = "";
    var fileName = [];
    //Prints content of github repo and handles downloading of files
    function printRepoCont() {
      var responseObj = JSON.parse(this.responseText);
      console.log(responseObj.filter((e) => e.name.includes(".js")));
      responseObj = responseObj.filter((e) => e.name.includes(".js"));

      for (let i = 0; i < responseObj.length; i++) {
        fileName.push(filePre + responseObj[i].name.replace(/.js/g, ""));
      }

      if (reqInc == 0) {
        filePre = "custom/";
        //Download scripts in custom folder from github
        getCustom();
        reqInc++;
      } else {
        console.log(fileName);
        //Download and runs scripts in base folder
        handleScripts();
      }
    }
    var request = new XMLHttpRequest();
    request.onload = printRepoCont;
    //Loads all scripts from files if you don't have internet
    request.onerror = function () {
      fs.readdir(directory, (err, files) => {
        files.forEach((file) => {
          //Looks for any js files in /pokeclicker-desktop/resources/
          if (file.includes(".js")) {
            //Checks if the file is not already included in the list of scripts in /pokeclicker-desktop/resources/scripts/
            //This means if i include a script with the same name as an existing one in /scripts/ it will be run instead of the base file?
            if (!cScripts.includes(file.replace(/.js/g, ""))) {
              //Execute the script
              mainWindow.webContents
                .executeJavaScript(
                  fs.readFileSync(`${__dirname}/../../${file}`).toString()
                )
                .catch((e) => {});
              //fs.appendFileSync(`${__dirname}/../../loadedvanilla.txt`, `\r\n${file.replace(/.js/g, "")}`, 'utf-8');
            }
          }
        });
      });
      //Same as this but for scripts in /pokeclicker-desktop/resources/scripts
      customScripts();
    };
    request.open(
      "get",
      "https://api.github.com/repos/Ephenia/Pokeclicker-Scripts/contents/",
      true
    );
    request.send();

    function getCustom() {
      var request = new XMLHttpRequest();
      request.onload = printRepoCont;
      request.open(
        "get",
        "https://api.github.com/repos/Ephenia/Pokeclicker-Scripts/contents/custom",
        true
      );
      request.send();
    }

    function handleScripts() {
      fileName.forEach((files, i) => {
        setTimeout(() => {
          var options = {
            host: "raw.githubusercontent.com",
            path: `/Ephenia/Pokeclicker-Scripts/master/${files}.js`,
          };
          var request = https.request(options, function (res) {
            var data = "";
            res.on("data", function (chunk) {
              data += chunk;
            });
            res.on("end", function () {
              files = files.replace(/custom[/]/g, "");
              console.log(data);
              var global_data;

              if (fs.existsSync(`${__dirname}/../../${files}.js`)) {
                global_data = fs.readFileSync(`${__dirname}/../../${files}.js`);
              } else {
                global_data = null;
              }

              try {
                if (data.toString() != global_data) {
                  fs.writeFileSync(
                    `${__dirname}/../../${files}.js`,
                    data,
                    "utf-8"
                  );
                }
              } catch (e) {
                console.log("Failed to save the file !");
              }

              try {
                if (
                  !cScripts.includes(files) &&
                  !files.includes("scripthandler")
                ) {
                  mainWindow.webContents
                    .executeJavaScript(
                      fs
                        .readFileSync(`${__dirname}/../../${files}.js`)
                        .toString()
                    )
                    .catch((e) => {});
                  //fs.appendFileSync(`${__dirname}/../../loadedvanilla.txt`, `\r\n${files}`, 'utf-8');
                }
              } catch (e) {}
            });
          });
          request.on("error", function (e) {
            console.log(e.message);
          });
          request.end();
        }, i * 1);
      });
      customScripts();
    }

    function customScripts() {
      fs.readdir(dirScript, (err, files) => {
        files.forEach((file) => {
          if (file.includes(".js")) {
            mainWindow.webContents
              .executeJavaScript(
                fs.readFileSync(`${__dirname}/../../scripts/${file}`).toString()
              )
              .catch((e) => {});
            //fs.appendFileSync(`${__dirname}/../../scripts/loadedcustom.txt`, `\r\n${file.replace(/.js/g, "")}`, 'utf-8');
          }
        });
      });
    }
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
    fs.writeFileSync("settings.ini", ini.stringify(config));
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
