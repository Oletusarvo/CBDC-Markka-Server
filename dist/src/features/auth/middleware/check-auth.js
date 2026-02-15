"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const create_handler_1 = require("../../../utils/create-handler");
const jwt_1 = require("../../../utils/jwt");
const get_access_token_1 = require("../util/get-access-token");
/**Creates a middleware-function that allows requests through if preventUnauthorizedAccess is false, otherwise returns 401 if an access token is not part of the request. Upon authorized access, adds a TSession-object as part of the request. */
const checkAuth = (preventUnauthorizedAccess = true) => (0, create_handler_1.createMiddleware)(async (req, res, next) => {
    const token = (0, get_access_token_1.getAccessToken)(req);
    if (!token && preventUnauthorizedAccess) {
        return res.status(401).end();
    }
    else if (token) {
        const payload = (0, jwt_1.verifyJWT)(token);
        req.session = {
            user: payload,
        };
    }
    next();
});
exports.checkAuth = checkAuth;
