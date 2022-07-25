"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacUpdater = void 0;
const builder_util_runtime_1 = require("builder-util-runtime");
const fs_extra_1 = require("fs-extra");
const fs_1 = require("fs");
const http_1 = require("http");
const AppUpdater_1 = require("./AppUpdater");
const Provider_1 = require("./providers/Provider");
class MacUpdater extends AppUpdater_1.AppUpdater {
    constructor(options, app) {
        super(options, app);
        this.nativeUpdater = require("electron").autoUpdater;
        this.squirrelDownloadedUpdate = false;
        this.nativeUpdater.on("error", it => {
            this._logger.warn(it);
            this.emit("error", it);
        });
        this.nativeUpdater.on("update-downloaded", () => {
            this.squirrelDownloadedUpdate = true;
        });
    }
    doDownloadUpdate(downloadUpdateOptions) {
        let files = downloadUpdateOptions.updateInfoAndProvider.provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info);
        // Allow arm64 macs to install universal or rosetta2(x64) - https://github.com/electron-userland/electron-builder/pull/5524
        const isArm64 = (file) => file.url.pathname.includes("arm64");
        if (files.some(isArm64)) {
            files = files.filter(file => (process.arch === "arm64") === isArm64(file));
        }
        const zipFileInfo = Provider_1.findFile(files, "zip", ["pkg", "dmg"]);
        if (zipFileInfo == null) {
            throw builder_util_runtime_1.newError(`ZIP file not provided: ${builder_util_runtime_1.safeStringifyJson(files)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
        }
        const server = http_1.createServer();
        server.on("close", () => {
            this._logger.info(`Proxy server for native Squirrel.Mac is closed (was started to download ${zipFileInfo.url.href})`);
        });
        function getServerUrl() {
            const address = server.address();
            return `http://127.0.0.1:${address.port}`;
        }
        return this.executeDownload({
            fileExtension: "zip",
            fileInfo: zipFileInfo,
            downloadUpdateOptions,
            task: (destinationFile, downloadOptions) => {
                return this.httpExecutor.download(zipFileInfo.url, destinationFile, downloadOptions);
            },
            done: async (event) => {
                const downloadedFile = event.downloadedFile;
                let updateFileSize = zipFileInfo.info.size;
                if (updateFileSize == null) {
                    updateFileSize = (await fs_extra_1.stat(downloadedFile)).size;
                }
                return await new Promise((resolve, reject) => {
                    // insecure random is ok
                    const fileUrl = `/${Date.now()}-${Math.floor(Math.random() * 9999)}.zip`;
                    server.on("request", (request, response) => {
                        const requestUrl = request.url;
                        this._logger.info(`${requestUrl} requested`);
                        if (requestUrl === "/") {
                            const data = Buffer.from(`{ "url": "${getServerUrl()}${fileUrl}" }`);
                            response.writeHead(200, { "Content-Type": "application/json", "Content-Length": data.length });
                            response.end(data);
                            return;
                        }
                        if (!requestUrl.startsWith(fileUrl)) {
                            this._logger.warn(`${requestUrl} requested, but not supported`);
                            response.writeHead(404);
                            response.end();
                            return;
                        }
                        this._logger.info(`${fileUrl} requested by Squirrel.Mac, pipe ${downloadedFile}`);
                        let errorOccurred = false;
                        response.on("finish", () => {
                            try {
                                setImmediate(() => server.close());
                            }
                            finally {
                                if (!errorOccurred) {
                                    this.nativeUpdater.removeListener("error", reject);
                                    resolve([]);
                                }
                            }
                        });
                        const readStream = fs_1.createReadStream(downloadedFile);
                        readStream.on("error", error => {
                            try {
                                response.end();
                            }
                            catch (e) {
                                this._logger.warn(`cannot end response: ${e}`);
                            }
                            errorOccurred = true;
                            this.nativeUpdater.removeListener("error", reject);
                            reject(new Error(`Cannot pipe "${downloadedFile}": ${error}`));
                        });
                        response.writeHead(200, {
                            "Content-Type": "application/zip",
                            "Content-Length": updateFileSize,
                        });
                        readStream.pipe(response);
                    });
                    server.listen(0, "127.0.0.1", () => {
                        this.nativeUpdater.setFeedURL({
                            url: getServerUrl(),
                            headers: { "Cache-Control": "no-cache" },
                        });
                        // The update has been downloaded and is ready to be served to Squirrel
                        this.dispatchUpdateDownloaded(event);
                        if (this.autoInstallOnAppQuit) {
                            this.nativeUpdater.once("error", reject);
                            // This will trigger fetching and installing the file on Squirrel side
                            this.nativeUpdater.checkForUpdates();
                        }
                        else {
                            resolve([]);
                        }
                    });
                });
            },
        });
    }
    quitAndInstall() {
        if (this.squirrelDownloadedUpdate) {
            // Update already fetched by Squirrel, it's ready to install
            this.nativeUpdater.quitAndInstall();
        }
        else {
            // Quit and install as soon as Squirrel get the update
            this.nativeUpdater.on("update-downloaded", () => {
                this.nativeUpdater.quitAndInstall();
            });
            // And trigger the update
            this.nativeUpdater.checkForUpdates();
        }
    }
}
exports.MacUpdater = MacUpdater;
//# sourceMappingURL=MacUpdater.js.map