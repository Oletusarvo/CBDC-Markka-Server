/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('currency_object', tbl => {
        tbl.uuid('id').primary().defaultTo(knex.fn.uuid());
        tbl
            .uuid('account_id')
            .references('id')
            .inTable('account')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        tbl
            .integer('currency_denom_type_id')
            .notNullable()
            .references('id')
            .inTable('currency_denom_type')
            .onUpdate('CASCADE');
        tbl.timestamp('minted_on').defaultTo(knex.fn.now());
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('currency_object');
};
