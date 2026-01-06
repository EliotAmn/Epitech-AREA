"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRecord = mapRecord;
exports.buildUrlParameters = buildUrlParameters;
exports.buildServiceRedirectUrl = buildServiceRedirectUrl;
function mapRecord(record, mapper) {
    return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, mapper(key, value)]));
}
function buildUrlParameters(basepath, params) {
    const urlParams = new URLSearchParams();
    for (const key in params) {
        const value = params[key];
        if (value !== undefined) {
            urlParams.append(key, String(value));
        }
    }
    const paramString = urlParams.toString();
    return paramString ? `${basepath}?${paramString}` : basepath;
}
function buildServiceRedirectUrl(service_name) {
    const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL;
    return `${frontendUrl}/oauth-service-proxy/${service_name}`;
}
//# sourceMappingURL=tools.js.map