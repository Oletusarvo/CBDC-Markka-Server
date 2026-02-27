const { loadSql } = require('../migration-utils/load-sql');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = await loadSql('verify-account-balance-on-update.sql');
      await knex.schema.raw(sql);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .raw('DROP TRIGGER IF EXISTS verify_account_balance_on_update')
    .raw('DROP FUNCTION IF EXISTS verify_account_balance_on_update');
};
