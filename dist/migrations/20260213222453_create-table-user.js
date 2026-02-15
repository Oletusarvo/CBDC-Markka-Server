/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('user', tbl => {
        tbl.uuid('id').primary().defaultTo(knex.fn.uuid());
        tbl.string('email').notNullable();
        tbl.string('password').notNullable();
        tbl.timestamps(true, true);
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('user');
};
