/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return new Promise(async (resolve, reject) => {
    await knex.transaction(async trx => {
      const accounts = await trx('account').select('email', 'password');
      for (const acc of accounts) {
        await trx('user').insert({
          email: acc.email,
          password: acc.password,
        });
      }
    });
    resolve();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex('user').del();
};
