/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.raw('ALTER TABLE currency_object RENAME COLUMN currency_denom_type_id TO denom_type_id');
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.raw('ALTER TABLE currency_object RENAME COLUMN denom_type_id TO currency_denom_type_id');
};
