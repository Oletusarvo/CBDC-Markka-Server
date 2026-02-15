/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('account', tbl => {
        tbl.renameColumn('balance', 'balance_in_cents');
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('account', tbl => {
        tbl.renameColumn('balance_in_cents', 'balance');
    });
};
