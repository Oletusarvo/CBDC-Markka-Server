"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCirculation = void 0;
const db_config_1 = require("../../../db-config");
const tablenames_1 = require("../../../tablenames");
const create_handler_1 = require("../../../utils/create-handler");
/**Returns the total quantity of tokens in circulation. */
exports.getCirculation = (0, create_handler_1.createHandler)(async (req, res) => {
    const result = await (0, db_config_1.db)(tablenames_1.tablenames.currencyObjects)
        .leftJoin(tablenames_1.tablenames.denomTypes, 'denom_type.id', 'currency_object.denom_type_id')
        .whereNotNull('currency_object.account_id')
        .sum('denom_type.value_in_cents as circulation')
        .first();
    return res.status(200).json({
        circulation: result?.circulation ?? 0,
    });
});
