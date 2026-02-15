/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return new Promise(async (resolve, reject) => {
    await knex.transaction(async trx => {
      const accs = await trx('account').select('email', 'id');
      for (const acc of accs) {
        await trx('account')
          .where({ id: acc.id })
          .update({
            user_id: knex.select('id').from('user').where({ email: acc.email }).limit(1),
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
  return Promise.resolve();
};
