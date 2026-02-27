"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTokens = void 0;
const db_config_1 = require("../../../db-config");
const tablenames_1 = require("../../../tablenames");
const create_handler_1 = require("../../../utils/create-handler");
const get_tokens_1 = require("../helpers/get-tokens");
/**Returns the tokens owned by the currently authenticated user. */
exports.getUserTokens = (0, create_handler_1.createHandler)(async (req, res) => {
    const session = req.session;
    const tokens = await (0, get_tokens_1.getTokens)(db_config_1.db).where({
        account_id: db_config_1.db
            .select('id')
            .from(tablenames_1.tablenames.accounts)
            .where({ user_id: session.user.id })
            .limit(1),
    });
    return res.status(200).json(tokens);
});
