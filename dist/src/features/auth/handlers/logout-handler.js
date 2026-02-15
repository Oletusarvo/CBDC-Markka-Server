"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutHandler = void 0;
const server_config_1 = require("../../../../server-config");
const create_handler_1 = require("../../../utils/create-handler");
exports.logoutHandler = (0, create_handler_1.createHandler)(async (req, res) => {
    res.clearCookie(server_config_1.serverConfig.accessTokenName);
    return res.status(200).end();
});
