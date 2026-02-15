/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('block', tbl => {
    tbl.uuid('id').primary().defaultTo(knex.fn.uuid());
    tbl.string('sequence').notNullable();
    tbl.boolean('solved').defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('block');
};
