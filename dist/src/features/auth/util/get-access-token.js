"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = getAccessToken;
const server_config_1 = require("../../../../server-config");
function getAccessToken(req) {
    //First try the cookie.
    let token = req.cookies[server_config_1.serverConfig.accessTokenName];
    if (!token) {
        //Access token not present as a cookie. Check authorization header.
        token = req.headers.authorization?.split(' ').at(1);
    }
    return token;
}
