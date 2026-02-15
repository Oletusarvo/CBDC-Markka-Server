"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccount = void 0;
const db_config_1 = require("../../../db-config");
const create_handler_1 = require("../../../utils/create-handler");
exports.getAccount = (0, create_handler_1.createHandler)(async (req, res) => {
    const session = req.session;
    const acc = await (0, db_config_1.db)('account')
        .where({ user_id: session.user.id })
        .select('balance_in_cents', 'id')
        .first();
    if (!acc) {
        return res.status(404).json({
            error: 'account:not-found',
        });
    }
    return res.status(200).json(acc);
});
