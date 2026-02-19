import { db } from '../../../db-config';
import { tablenames } from '../../../tablenames';
import { AuthenticatedExpressRequest } from '../../../types/express';

import { createHandler } from '../../../utils/create-handler';

/**Transfers money between two accounts. */
export const createTransaction = createHandler(async (req: AuthenticatedExpressRequest, res) => {
  const session = req.session;

  const senderAccount = await db(tablenames.accounts)
    .where({ user_id: session.user.id })
    .select('balance_in_cents', 'id')
    .first();

  const receiverAccount = await db(tablenames.accounts)
    .where({
      id: db
        .select('id')
        .from(tablenames.accounts)
        .where({
          user_id: db.select('id').from(tablenames.users).where({ email: req.data.email }).limit(1),
        })
        .limit(1),
    })
    .select('id')
    .first();

  //Convert to cents.
  const amt_in_cents = req.data.amt * 100;

  if (!senderAccount) {
    return res.status(404).json({
      error: 'transaction:sender-invalid',
    });
  } else if (!receiverAccount) {
    return res.status(404).json({
      error: 'transaction:invalid-recipient',
    });
  } else if (senderAccount.id === receiverAccount.id) {
    return res.status(409).json({
      error: 'transaction:self-transaction',
    });
  } else if (amt_in_cents > senderAccount.balance_in_cents) {
    return res.status(409).json({
      error: 'transaction:insufficient-funds',
    });
  }

  await db.transaction(async trx => {
    await trx(tablenames.accounts)
      .where({ id: senderAccount.id })
      .decrement('balance_in_cents', amt_in_cents);

    await trx(tablenames.accounts)
      .where({ id: receiverAccount.id })
      .increment('balance_in_cents', amt_in_cents);

    await trx(tablenames.transactions).insert({
      from: senderAccount.id,
      to: receiverAccount.id,
      amount_in_cents: amt_in_cents,
      message: req.data.message,
    });
  });

  return res.status(200).end();
});
