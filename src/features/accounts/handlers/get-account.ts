import { db } from '../../../db-config';
import { AuthenticatedExpressRequest } from '../../../types/express';
import { createHandler } from '../../../utils/create-handler';

export const getAccount = createHandler(async (req: AuthenticatedExpressRequest, res) => {
  const session = req.session;
  const acc = await db('account')
    .where({ user_id: session.user.id })
    .select('balance_in_cents', 'id')
    .first();
  if (!acc) {
    return res.status(404).json({
      error: 'account:not-found',
    });
  }
  return res.status(200).json(acc);
});
