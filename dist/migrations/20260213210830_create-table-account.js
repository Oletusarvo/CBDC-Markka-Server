/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('account', tbl => {
        tbl.uuid('id').primary().defaultTo(knex.fn.uuid());
        tbl.string('email').notNullable().unique();
        tbl.string('password').notNullable();
        tbl.bigint('balance').defaultTo(0);
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('account');
};
