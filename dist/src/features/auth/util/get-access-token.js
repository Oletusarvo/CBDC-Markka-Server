"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = getAccessToken;
const server_config_1 = require("../../../../server-config");
function getAccessToken(req) {
    return req.cookies[server_config_1.serverConfig.accessTokenName];
}
