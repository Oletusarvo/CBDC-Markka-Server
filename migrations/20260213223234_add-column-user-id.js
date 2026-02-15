/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('account', tbl => {
    tbl.uuid('user_id').references('id').inTable('user').onUpdate('CASCADE').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('account', tbl => {
    tbl.dropColumn('user_id');
  });
};
