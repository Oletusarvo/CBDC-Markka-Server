"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserHandler = void 0;
const create_handler_1 = require("../../../utils/create-handler");
const db_config_1 = require("../../../db-config");
const password_1 = require("../../../utils/password");
const currency_util_1 = require("../../currencies/util/currency-util");
const tablenames_1 = require("../../../tablenames");
const MAX_SUPPLY_IN_CENTS = 110_000_000_000;
exports.registerUserHandler = (0, create_handler_1.createHandler)(async (req, res) => {
    const credentials = req.data;
    await db_config_1.db.transaction(async (trx) => {
        const [user] = await trx(tablenames_1.tablenames.users)
            .insert({
            email: credentials.email,
            password: await (0, password_1.hashPassword)(credentials.password1),
        })
            .returning('id');
        const [acc] = await trx(tablenames_1.tablenames.accounts)
            .insert({
            user_id: user.id,
        })
            .returning('id');
        const currentSupplyInCents = await trx(tablenames_1.tablenames.currencyObjects)
            .leftJoin(tablenames_1.tablenames.denomTypes, 'denom_type.id', 'currency_object.denom_type_id')
            .whereNotNull('currency_object.account_id')
            .sum('denom_type.value_in_cents as total')
            .first();
        if (currentSupplyInCents.total + 2000 > MAX_SUPPLY_IN_CENTS) {
            return;
        }
        const reserveTokens = await trx(tablenames_1.tablenames.currencyObjects)
            .whereNull('account_id')
            .whereIn('denom_type_id', trx.select('id').from(tablenames_1.tablenames.denomTypes).where('value_in_cents', '<=', 2000))
            .forUpdate()
            .skipLocked()
            .limit(200);
        if (reserveTokens.length > 0 && (0, currency_util_1.containsExactly)(reserveTokens, 2000)) {
            //Give the unassigned tokens to the new user.
            const tokens = (0, currency_util_1.pick)(reserveTokens, 2000);
            await trx(tablenames_1.tablenames.currencyObjects)
                .whereIn('id', tokens.map(t => t.id))
                .update(tokens.map(t => {
                return {
                    ...t,
                    account_id: acc.id,
                };
            }));
        }
        else {
            //Mint new tokens to give to the user
            const mintedTokens = (0, currency_util_1.mint)(2000);
            await Promise.all(mintedTokens.map(async (t) => {
                await trx(tablenames_1.tablenames.currencyObjects).insert({
                    account_id: acc.id,
                    currency_denom_type_id: trx
                        .select('id')
                        .from(tablenames_1.tablenames.denomTypes)
                        .where({ value_in_cents: t })
                        .limit(1),
                });
            }));
        }
    });
    return res.status(200).end();
}, (err, res) => {
    const msg = err.message.toLowerCase();
    if (msg.includes('duplicate')) {
        if (msg.includes('user_email')) {
            return res.status(409).json({
                error: 'auth:email-taken',
            });
        }
    }
});
