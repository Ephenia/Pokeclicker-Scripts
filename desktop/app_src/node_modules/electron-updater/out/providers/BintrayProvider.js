"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BintrayProvider = void 0;
const builder_util_runtime_1 = require("builder-util-runtime");
const bintray_1 = require("builder-util-runtime/out/bintray");
const url_1 = require("url");
const util_1 = require("../util");
const Provider_1 = require("./Provider");
class BintrayProvider extends Provider_1.Provider {
    constructor(configuration, runtimeOptions) {
        super(runtimeOptions);
        this.client = new bintray_1.BintrayClient(configuration, runtimeOptions.executor, new builder_util_runtime_1.CancellationToken());
        this.baseUrl = util_1.newBaseUrl(`https://dl.bintray.com/${this.client.owner}/${this.client.repo}`);
    }
    setRequestHeaders(value) {
        super.setRequestHeaders(value);
        this.client.setRequestHeaders(value);
    }
    async getLatestVersion() {
        try {
            const data = await this.client.getVersion("_latest");
            const channelFilename = util_1.getChannelFilename(this.getDefaultChannelName());
            const files = await this.client.getVersionFiles(data.name);
            const channelFile = files.find(it => it.name.endsWith(`_${channelFilename}`) || it.name.endsWith(`-${channelFilename}`));
            if (channelFile == null) {
                // noinspection ExceptionCaughtLocallyJS
                throw builder_util_runtime_1.newError(`Cannot find channel file "${channelFilename}", existing files:\n${files.map(it => JSON.stringify(it, null, 2)).join(",\n")}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
            }
            const channelFileUrl = new url_1.URL(`https://dl.bintray.com/${this.client.owner}/${this.client.repo}/${channelFile.name}`);
            return Provider_1.parseUpdateInfo(await this.httpRequest(channelFileUrl), channelFilename, channelFileUrl);
        }
        catch (e) {
            if ("statusCode" in e && e.statusCode === 404) {
                throw builder_util_runtime_1.newError(`No latest version, please ensure that user, package and repository correctly configured. Or at least one version is published. ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
            }
            throw e;
        }
    }
    resolveFiles(updateInfo) {
        return Provider_1.resolveFiles(updateInfo, this.baseUrl);
    }
}
exports.BintrayProvider = BintrayProvider;
//# sourceMappingURL=BintrayProvider.js.map