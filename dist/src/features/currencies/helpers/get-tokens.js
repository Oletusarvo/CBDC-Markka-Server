"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokens = getTokens;
const db_config_1 = require("../../../db-config");
const tablenames_1 = require("../../../tablenames");
/**Returns tokens and joins the denom type table into the result. */
function getTokens(ctx) {
    return ctx(tablenames_1.tablenames.currencyObjects)
        .leftJoin(tablenames_1.tablenames.denomTypes, 'denom_type.id', 'currency_object.denom_type_id')
        .select('currency_object.id', 'currency_object.minted_on', db_config_1.db.raw('CAST(denom_type.value_in_cents as INT) as value_in_cents'));
}
