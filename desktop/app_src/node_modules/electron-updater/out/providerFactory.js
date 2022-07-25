"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = exports.isUrlProbablySupportMultiRangeRequests = void 0;
const builder_util_runtime_1 = require("builder-util-runtime");
const BintrayProvider_1 = require("./providers/BintrayProvider");
const GenericProvider_1 = require("./providers/GenericProvider");
const GitHubProvider_1 = require("./providers/GitHubProvider");
const PrivateGitHubProvider_1 = require("./providers/PrivateGitHubProvider");
function isUrlProbablySupportMultiRangeRequests(url) {
    return !url.includes("s3.amazonaws.com");
}
exports.isUrlProbablySupportMultiRangeRequests = isUrlProbablySupportMultiRangeRequests;
function createClient(data, updater, runtimeOptions) {
    // noinspection SuspiciousTypeOfGuard
    if (typeof data === "string") {
        throw builder_util_runtime_1.newError("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    }
    const provider = data.provider;
    switch (provider) {
        case "github": {
            const githubOptions = data;
            const token = (githubOptions.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || githubOptions.token;
            if (token == null) {
                return new GitHubProvider_1.GitHubProvider(githubOptions, updater, runtimeOptions);
            }
            else {
                return new PrivateGitHubProvider_1.PrivateGitHubProvider(githubOptions, updater, token, runtimeOptions);
            }
        }
        case "s3":
        case "spaces":
            return new GenericProvider_1.GenericProvider({
                provider: "generic",
                url: builder_util_runtime_1.getS3LikeProviderBaseUrl(data),
                channel: data.channel || null,
            }, updater, {
                ...runtimeOptions,
                // https://github.com/minio/minio/issues/5285#issuecomment-350428955
                isUseMultipleRangeRequest: false,
            });
        case "generic": {
            const options = data;
            return new GenericProvider_1.GenericProvider(options, updater, {
                ...runtimeOptions,
                isUseMultipleRangeRequest: options.useMultipleRangeRequest !== false && isUrlProbablySupportMultiRangeRequests(options.url),
            });
        }
        case "bintray":
            return new BintrayProvider_1.BintrayProvider(data, runtimeOptions);
        default:
            throw builder_util_runtime_1.newError(`Unsupported provider: ${provider}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
}
exports.createClient = createClient;
//# sourceMappingURL=providerFactory.js.map