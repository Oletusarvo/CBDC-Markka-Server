import { db } from '../../../db-config';
import { AuthenticatedExpressRequest } from '../../../types/express';
import { createHandler } from '../../../utils/create-handler';
import { getTokens } from '../helpers/get-tokens';

export const getUserTokens = createHandler(async (req: AuthenticatedExpressRequest, res) => {
  const session = req.session;
  const tokens = await getTokens(db).where({
    account_id: db.select('id').from('account').where({ user_id: session.user.id }).limit(1),
  });
  return res.status(200).json({
    tokens,
  });
});
