"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includeAuth = void 0;
const create_handler_1 = require("../../../utils/create-handler");
const get_access_token_1 = require("../util/get-access-token");
exports.includeAuth = (0, create_handler_1.createMiddleware)(async (req, res, next) => {
    const token = (0, get_access_token_1.getAccessToken)(req);
    if (token) {
        //Decode the token and include the session as part of the request.
    }
});
