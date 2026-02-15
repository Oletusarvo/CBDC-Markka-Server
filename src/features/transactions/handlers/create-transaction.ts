import { db } from '../../../db-config';
import { AuthenticatedExpressRequest } from '../../../types/express';

import { createHandler } from '../../../utils/create-handler';

/**Transfers money between two accounts. */
export const createTransaction = createHandler(async (req: AuthenticatedExpressRequest, res) => {
  const session = req.session;

  const sender = await db('account')
    .where({ user_id: session.user.id })
    .select('balance_in_cents', 'id')
    .first();

  const receiver = await db('account')
    .where({
      id: db
        .select('id')
        .from('account')
        .where({
          user_id: db.select('id').from('user').where({ email: req.data.email }).limit(1),
        })
        .limit(1),
    })
    .select('id')
    .first();

  //Convert to cents.
  const amt_in_cents = req.data.amt * 100;

  if (!sender) {
    return res.status(404).json({
      error: 'The sender account does not exist!',
    });
  } else if (!receiver) {
    return res.status(404).json({
      error: 'The receiver account does not exist!',
    });
  } else if (amt_in_cents > sender.balance_in_cents) {
    return res.status(409).json({
      error: 'account:insufficient_funds',
    });
  }

  await db.transaction(async trx => {
    await trx('account').where({ id: sender.id }).decrement('balance_in_cents', amt_in_cents);
    await trx('account').where({ id: receiver.id }).increment('balance_in_cents', amt_in_cents);
    await trx('transaction').insert({
      from: sender.id,
      to: receiver.id,
      amount_in_cents: amt_in_cents,
      message: req.data.message,
    });
  });

  return res.status(200).end();
});
