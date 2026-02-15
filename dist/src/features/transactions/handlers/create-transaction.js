"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = void 0;
const db_config_1 = require("../../../db-config");
const create_handler_1 = require("../../../utils/create-handler");
/**Transfers money between two accounts. */
exports.createTransaction = (0, create_handler_1.createHandler)(async (req, res) => {
    const session = req.session;
    const sender = await (0, db_config_1.db)('account')
        .where({ user_id: session.user.id })
        .select('balance_in_cents', 'id')
        .first();
    const receiver = await (0, db_config_1.db)('account')
        .where({
        id: db_config_1.db
            .select('id')
            .from('account')
            .where({
            user_id: db_config_1.db.select('id').from('user').where({ email: req.data.email }).limit(1),
        })
            .limit(1),
    })
        .select('id')
        .first();
    //Convert to cents.
    const amt_in_cents = req.data.amt * 100;
    if (!sender) {
        return res.status(404).json({
            error: 'The sender account does not exist!',
        });
    }
    else if (!receiver) {
        return res.status(404).json({
            error: 'The receiver account does not exist!',
        });
    }
    else if (amt_in_cents > sender.balance_in_cents) {
        return res.status(409).json({
            error: 'account:insufficient_funds',
        });
    }
    await db_config_1.db.transaction(async (trx) => {
        await trx('account').where({ id: sender.id }).decrement('balance_in_cents', amt_in_cents);
        await trx('account').where({ id: receiver.id }).increment('balance_in_cents', amt_in_cents);
        await trx('transaction').insert({
            from: sender.id,
            to: receiver.id,
            amount_in_cents: amt_in_cents,
            message: req.data.message,
        });
    });
    return res.status(200).end();
});
