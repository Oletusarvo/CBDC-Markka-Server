import { db } from '../../../db-config';
import { tablenames } from '../../../tablenames';
import { AuthenticatedExpressRequest } from '../../../types/express';
import { createHandler } from '../../../utils/create-handler';

/**Returns all transactions where the currently authenticated user's account is involved. */
export const getTransactions = createHandler(async (req: AuthenticatedExpressRequest, res) => {
  const session = req.session;
  const acc = await db(tablenames.accounts)
    .where({ user_id: session.user.id })
    .select('id')
    .first();
  const transactions = await db({ transaction: tablenames.transactions })
    .where({ from: acc.id })
    .orWhere({ to: acc.id })
    .leftJoin(
      db.select('id', 'user_id').from(tablenames.accounts).as('from_acc').groupBy('id'),
      'from_acc.id',
      'transaction.from',
    )
    .leftJoin(
      db.select('user_id', 'id').from(tablenames.accounts).as('to_acc').groupBy('id'),
      'to_acc.id',
      'transaction.to',
    )
    .leftJoin(
      db.select('email', 'id').from(tablenames.users).as('from_user').groupBy('id'),
      'from_user.id',
      'from_acc.user_id',
    )
    .leftJoin(
      db.select('email', 'id').from(tablenames.users).as('to_user').groupBy('id'),
      'to_user.id',
      'to_acc.user_id',
    )
    .select('transaction.*', 'from_user.email as from_email', 'to_user.email as to_email')
    .orderBy('transaction.timestamp', 'desc');
  return res.status(200).json(transactions);
});
