"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = void 0;
const db_config_1 = require("../../../db-config");
const create_handler_1 = require("../../../utils/create-handler");
/**Returns all transactions where the currently authenticated user's account is involved. */
exports.getTransactions = (0, create_handler_1.createHandler)(async (req, res) => {
    const session = req.session;
    const acc = await (0, db_config_1.db)('account').where({ user_id: session.user.id }).select('id').first();
    const transactions = await (0, db_config_1.db)('transaction')
        .where({ from: acc.id })
        .orWhere({ to: acc.id })
        .leftJoin(db_config_1.db.select('id', 'user_id').from('account').as('from_acc').groupBy('id'), 'from_acc.id', 'transaction.from')
        .leftJoin(db_config_1.db.select('user_id', 'id').from('account').as('to_acc').groupBy('id'), 'to_acc.id', 'transaction.to')
        .leftJoin(db_config_1.db.select('email', 'id').from('user').as('from_user').groupBy('id'), 'from_user.id', 'from_acc.user_id')
        .leftJoin(db_config_1.db.select('email', 'id').from('user').as('to_user').groupBy('id'), 'to_user.id', 'to_acc.user_id')
        .select('transaction.*', 'from_user.email as from_email', 'to_user.email as to_email')
        .orderBy('transaction.timestamp', 'desc');
    return res.status(200).json(transactions);
});
