"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeReleaseNotes = exports.GitHubProvider = exports.BaseGitHubProvider = void 0;
const builder_util_runtime_1 = require("builder-util-runtime");
const semver = require("semver");
const url_1 = require("url");
const util_1 = require("../util");
const Provider_1 = require("./Provider");
const hrefRegExp = /\/tag\/v?([^/]+)$/;
class BaseGitHubProvider extends Provider_1.Provider {
    constructor(options, defaultHost, runtimeOptions) {
        super({
            ...runtimeOptions,
            /* because GitHib uses S3 */
            isUseMultipleRangeRequest: false,
        });
        this.options = options;
        this.baseUrl = util_1.newBaseUrl(builder_util_runtime_1.githubUrl(options, defaultHost));
        const apiHost = defaultHost === "github.com" ? "api.github.com" : defaultHost;
        this.baseApiUrl = util_1.newBaseUrl(builder_util_runtime_1.githubUrl(options, apiHost));
    }
    computeGithubBasePath(result) {
        // https://github.com/electron-userland/electron-builder/issues/1903#issuecomment-320881211
        const host = this.options.host;
        return host != null && host !== "github.com" && host !== "api.github.com" ? `/api/v3${result}` : result;
    }
}
exports.BaseGitHubProvider = BaseGitHubProvider;
class GitHubProvider extends BaseGitHubProvider {
    constructor(options, updater, runtimeOptions) {
        super(options, "github.com", runtimeOptions);
        this.options = options;
        this.updater = updater;
    }
    async getLatestVersion() {
        const cancellationToken = new builder_util_runtime_1.CancellationToken();
        const feedXml = (await this.httpRequest(util_1.newUrlFromBase(`${this.basePath}.atom`, this.baseUrl), {
            accept: "application/xml, application/atom+xml, text/xml, */*",
        }, cancellationToken));
        const feed = builder_util_runtime_1.parseXml(feedXml);
        // noinspection TypeScriptValidateJSTypes
        let latestRelease = feed.element("entry", false, `No published versions on GitHub`);
        let version;
        try {
            if (this.updater.allowPrerelease) {
                // noinspection TypeScriptValidateJSTypes
                version = hrefRegExp.exec(latestRelease.element("link").attribute("href"))[1];
            }
            else {
                version = await this.getLatestVersionString(cancellationToken);
                for (const element of feed.getElements("entry")) {
                    // noinspection TypeScriptValidateJSTypes
                    if (hrefRegExp.exec(element.element("link").attribute("href"))[1] === version) {
                        latestRelease = element;
                        break;
                    }
                }
            }
        }
        catch (e) {
            throw builder_util_runtime_1.newError(`Cannot parse releases feed: ${e.stack || e.message},\nXML:\n${feedXml}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
        }
        if (version == null) {
            throw builder_util_runtime_1.newError(`No published versions on GitHub`, "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
        }
        const channelFile = util_1.getChannelFilename(this.getDefaultChannelName());
        const channelFileUrl = util_1.newUrlFromBase(this.getBaseDownloadPath(version, channelFile), this.baseUrl);
        const requestOptions = this.createRequestOptions(channelFileUrl);
        let rawData;
        try {
            rawData = (await this.executor.request(requestOptions, cancellationToken));
        }
        catch (e) {
            if (!this.updater.allowPrerelease && e instanceof builder_util_runtime_1.HttpError && e.statusCode === 404) {
                throw builder_util_runtime_1.newError(`Cannot find ${channelFile} in the latest release artifacts (${channelFileUrl}): ${e.stack || e.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
            }
            throw e;
        }
        const result = Provider_1.parseUpdateInfo(rawData, channelFile, channelFileUrl);
        if (result.releaseName == null) {
            result.releaseName = latestRelease.elementValueOrEmpty("title");
        }
        if (result.releaseNotes == null) {
            result.releaseNotes = computeReleaseNotes(this.updater.currentVersion, this.updater.fullChangelog, feed, latestRelease);
        }
        return result;
    }
    async getLatestVersionString(cancellationToken) {
        const options = this.options;
        // do not use API for GitHub to avoid limit, only for custom host or GitHub Enterprise
        const url = options.host == null || options.host === "github.com"
            ? util_1.newUrlFromBase(`${this.basePath}/latest`, this.baseUrl)
            : new url_1.URL(`${this.computeGithubBasePath(`/repos/${options.owner}/${options.repo}/releases`)}/latest`, this.baseApiUrl);
        try {
            const rawData = await this.httpRequest(url, { Accept: "application/json" }, cancellationToken);
            if (rawData == null) {
                return null;
            }
            const releaseInfo = JSON.parse(rawData);
            return releaseInfo.tag_name.startsWith("v") ? releaseInfo.tag_name.substring(1) : releaseInfo.tag_name;
        }
        catch (e) {
            throw builder_util_runtime_1.newError(`Unable to find latest version on GitHub (${url}), please ensure a production release exists: ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
        }
    }
    get basePath() {
        return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(updateInfo) {
        // still replace space to - due to backward compatibility
        return Provider_1.resolveFiles(updateInfo, this.baseUrl, p => this.getBaseDownloadPath(updateInfo.version, p.replace(/ /g, "-")));
    }
    getBaseDownloadPath(version, fileName) {
        return `${this.basePath}/download/${this.options.vPrefixedTagName === false ? "" : "v"}${version}/${fileName}`;
    }
}
exports.GitHubProvider = GitHubProvider;
function getNoteValue(parent) {
    const result = parent.elementValueOrEmpty("content");
    // GitHub reports empty notes as <content>No content.</content>
    return result === "No content." ? "" : result;
}
function computeReleaseNotes(currentVersion, isFullChangelog, feed, latestRelease) {
    if (!isFullChangelog) {
        return getNoteValue(latestRelease);
    }
    const releaseNotes = [];
    for (const release of feed.getElements("entry")) {
        // noinspection TypeScriptValidateJSTypes
        const versionRelease = /\/tag\/v?([^/]+)$/.exec(release.element("link").attribute("href"))[1];
        if (semver.lt(currentVersion, versionRelease)) {
            releaseNotes.push({
                version: versionRelease,
                note: getNoteValue(release),
            });
        }
    }
    return releaseNotes.sort((a, b) => semver.rcompare(a.version, b.version));
}
exports.computeReleaseNotes = computeReleaseNotes;
//# sourceMappingURL=GitHubProvider.js.map