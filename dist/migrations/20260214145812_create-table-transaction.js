/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('transaction', tbl => {
        tbl.uuid('id').primary().defaultTo(knex.fn.uuid());
        tbl
            .uuid('from')
            .notNullable()
            .references('id')
            .inTable('account')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
        tbl
            .uuid('to')
            .notNullable()
            .references('id')
            .inTable('account')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
        tbl.bigint('amount_in_cents').notNullable();
        tbl.timestamp('timestamp').defaultTo(knex.fn.now());
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('transaction');
};
