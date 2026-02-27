"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = void 0;
const server_config_1 = require("../../../../server-config");
const db_config_1 = require("../../../db-config");
const tablenames_1 = require("../../../tablenames");
const create_handler_1 = require("../../../utils/create-handler");
const jwt_1 = require("../../../utils/jwt");
const password_1 = require("../../../utils/password");
exports.loginHandler = (0, create_handler_1.createHandler)(async (req, res) => {
    const credentials = req.body;
    const user = await (0, db_config_1.db)(tablenames_1.tablenames.users)
        .where({ email: credentials.email })
        .select('password', 'id', 'email')
        .first();
    if (!user) {
        return res.status(404).json({
            error: 'auth:not-found',
        });
    }
    const passwordOk = await (0, password_1.verifyPassword)(credentials.password, user.password);
    if (!passwordOk) {
        return res.status(401).json({
            error: 'auth:invalid-password',
        });
    }
    const token = (0, jwt_1.createJWT)({
        id: user.id,
        email: user.email,
    });
    return res
        .status(200)
        .cookie(server_config_1.serverConfig.accessTokenName, token, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    })
        .json({
        token,
    });
});
