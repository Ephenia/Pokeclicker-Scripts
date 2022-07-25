"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdaterSignal = exports.UPDATE_DOWNLOADED = exports.DOWNLOAD_PROGRESS = void 0;
exports.DOWNLOAD_PROGRESS = "download-progress";
exports.UPDATE_DOWNLOADED = "update-downloaded";
class UpdaterSignal {
    constructor(emitter) {
        this.emitter = emitter;
    }
    /**
     * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
     */
    login(handler) {
        addHandler(this.emitter, "login", handler);
    }
    progress(handler) {
        addHandler(this.emitter, exports.DOWNLOAD_PROGRESS, handler);
    }
    updateDownloaded(handler) {
        addHandler(this.emitter, exports.UPDATE_DOWNLOADED, handler);
    }
    updateCancelled(handler) {
        addHandler(this.emitter, "update-cancelled", handler);
    }
}
exports.UpdaterSignal = UpdaterSignal;
const isLogEvent = false;
function addHandler(emitter, event, handler) {
    if (isLogEvent) {
        emitter.on(event, (...args) => {
            console.log("%s %s", event, args);
            handler(...args);
        });
    }
    else {
        emitter.on(event, handler);
    }
}
//# sourceMappingURL=event.js.map