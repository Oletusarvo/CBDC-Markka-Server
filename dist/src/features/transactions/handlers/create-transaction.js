"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = void 0;
const db_config_1 = require("../../../db-config");
const tablenames_1 = require("../../../tablenames");
const create_handler_1 = require("../../../utils/create-handler");
/**Transfers money between two accounts. */
exports.createTransaction = (0, create_handler_1.createHandler)(async (req, res) => {
    const session = req.session;
    const senderAccount = await (0, db_config_1.db)(tablenames_1.tablenames.accounts)
        .where({ user_id: session.user.id })
        .select('balance_in_cents', 'id')
        .first();
    const receiverAccount = await (0, db_config_1.db)(tablenames_1.tablenames.accounts)
        .where({
        id: db_config_1.db
            .select('id')
            .from(tablenames_1.tablenames.accounts)
            .where({
            user_id: db_config_1.db.select('id').from(tablenames_1.tablenames.users).where({ email: req.data.email }).limit(1),
        })
            .limit(1),
    })
        .select('id')
        .first();
    //Convert to cents.
    const amt_in_cents = req.data.amt * 100;
    if (!senderAccount) {
        return res.status(404).json({
            error: 'transaction:sender-invalid',
        });
    }
    else if (!receiverAccount) {
        return res.status(404).json({
            error: 'transaction:invalid-recipient',
        });
    }
    else if (senderAccount.id === receiverAccount.id) {
        return res.status(409).json({
            error: 'transaction:self-transaction',
        });
    }
    else if (amt_in_cents > senderAccount.balance_in_cents) {
        return res.status(409).json({
            error: 'transaction:insufficient-funds',
        });
    }
    await db_config_1.db.transaction(async (trx) => {
        await trx(tablenames_1.tablenames.accounts)
            .where({ id: senderAccount.id })
            .decrement('balance_in_cents', amt_in_cents);
        await trx(tablenames_1.tablenames.accounts)
            .where({ id: receiverAccount.id })
            .increment('balance_in_cents', amt_in_cents);
        await trx(tablenames_1.tablenames.transactions).insert({
            from: senderAccount.id,
            to: receiverAccount.id,
            amount_in_cents: amt_in_cents,
            message: req.data.message,
        });
    });
    return res.status(200).end();
});
