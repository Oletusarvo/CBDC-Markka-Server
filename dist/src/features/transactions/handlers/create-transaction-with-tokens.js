"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionWithTokens = void 0;
const db_config_1 = require("../../../db-config");
const tablenames_1 = require("../../../tablenames");
const create_handler_1 = require("../../../utils/create-handler");
const get_tokens_1 = require("../../currencies/helpers/get-tokens");
const currency_util_1 = require("../../currencies/util/currency-util");
exports.createTransactionWithTokens = (0, create_handler_1.createHandler)(async (req, res) => {
    const session = req.session;
    const senderAccount = await (0, db_config_1.db)(tablenames_1.tablenames.accounts)
        .where({ user_id: session.user.id })
        .select('id')
        .first();
    if (!senderAccount) {
        return res.status(404).json({
            error: 'transaction:invalid-sender',
        });
    }
    const receiverAccount = await (0, db_config_1.db)(tablenames_1.tablenames.accounts)
        .where({
        user_id: db_config_1.db.select('id').from(tablenames_1.tablenames.users).where({ email: req.data.email }).limit(1),
    })
        .first();
    if (!receiverAccount) {
        return res.status(404).json({
            error: 'transaction:invalid-receiver',
        });
    }
    const amtInCents = req.data.amt * 100;
    const senderTokens = await (0, get_tokens_1.getTokens)(db_config_1.db).where({
        account_id: senderAccount.id,
    });
    if ((0, currency_util_1.sumTokens)(senderTokens) < amtInCents) {
        return res.status(409).json({
            error: 'transaction:insufficient-funds',
        });
    }
    const receiverTokens = await (0, get_tokens_1.getTokens)(db_config_1.db).where({
        account_id: receiverAccount.id,
    });
    const reserveTokens = await (0, get_tokens_1.getTokens)(db_config_1.db)
        .whereNull('account_id')
        .orderBy('denom_type.value_in_cents', 'desc')
        .limit(200);
    const tender = (0, currency_util_1.pick)(senderTokens, amtInCents);
    const tenderSum = (0, currency_util_1.sumTokens)(tender);
    const changeAmtInCents = tenderSum - amtInCents;
    const finalTokensToMint = [];
    const finalTokensToUpdate = [];
    const assignFinalTokensToUpdate = (toSender = [], toReceiver = [], toReserve = []) => {
        finalTokensToUpdate.push(...toSender.map(t => {
            return {
                ...t,
                old_account_id: receiverAccount.id,
                account_id: senderAccount.id,
            };
        }), ...toReceiver.map(t => {
            return {
                ...t,
                old_account_id: senderAccount.id,
                account_id: receiverAccount.id,
            };
        }), ...toReserve.map(t => {
            return {
                ...t,
                account_id: null,
                old_account_id: senderAccount.id,
            };
        }));
    };
    const assignFinalTokensToMint = (toSender = [], toReceiver = []) => {
        finalTokensToMint.push(...toSender.map(t => {
            return {
                value_in_cents: t.value_in_cents,
                account_id: senderAccount.id,
            };
        }), ...toReceiver.map(t => {
            return {
                value_in_cents: t.value_in_cents,
                account_id: receiverAccount.id,
            };
        }));
    };
    if (changeAmtInCents > 0) {
        //1. Try to get change from the receiver. Has to be exact.
        if ((0, currency_util_1.containsExactly)(receiverTokens, changeAmtInCents)) {
            console.log('Getting change from receiver...');
            const change = (0, currency_util_1.pick)(receiverTokens, changeAmtInCents);
            assignFinalTokensToUpdate(change, tender);
        }
        //2. Try to get change from the reserve. Has to be exact.
        else if ((0, currency_util_1.containsExactly)(reserveTokens, amtInCents) &&
            //This should check the reserve without the amount in cents, against the change.
            (0, currency_util_1.containsExactly)((0, currency_util_1.without)(reserveTokens, amtInCents), changeAmtInCents)) {
            console.log('Getting change from reserve...');
            const change = (0, currency_util_1.pick)(reserveTokens, changeAmtInCents);
            const toReceiver = (0, currency_util_1.pick)(reserveTokens, amtInCents);
            assignFinalTokensToUpdate(change, toReceiver, tender);
        }
        else {
            //Mint new coins. Put original tender in reserve.
            console.log('Minting change and tender...');
            const toReceiver = (0, currency_util_1.mint)(amtInCents);
            const change = (0, currency_util_1.mint)(changeAmtInCents);
            assignFinalTokensToUpdate([], [], tender);
            assignFinalTokensToMint(change, toReceiver);
        }
    }
    else {
        //No change; just give the tender to the receiver.
        assignFinalTokensToUpdate([], tender);
    }
    await db_config_1.db.transaction(async (trx) => {
        for (const t of finalTokensToUpdate) {
            const rows = await trx(tablenames_1.tablenames.currencyObjects)
                .where({ id: t.id, account_id: t.old_account_id })
                .update({
                account_id: t.account_id,
            });
            if (rows !== 1) {
                throw new Error('Double spend detected!');
            }
        }
        for (const t of finalTokensToMint) {
            await trx(tablenames_1.tablenames.currencyObjects).insert({
                account_id: t.account_id,
                denom_type_id: trx
                    .select('id')
                    .from('denom_type')
                    .where({ value_in_cents: t.value_in_cents })
                    .limit(1),
            });
        }
        await trx(tablenames_1.tablenames.transactions).insert({
            from: senderAccount.id,
            to: receiverAccount.id,
            amount_in_cents: amtInCents,
            message: req.data.message,
        });
    });
    return res.status(200).end();
}, (err, res) => {
    if (err.message.includes('Double spend')) {
        return res.status(409).json({
            error: 'transaction:double-spend',
        });
    }
    return res.status(500).end();
});
