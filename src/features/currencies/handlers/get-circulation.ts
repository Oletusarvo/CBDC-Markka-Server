import { db } from '../../../db-config';
import { createHandler } from '../../../utils/create-handler';

export const getCirculation = createHandler(async (req, res) => {
  const result = await db('account').sum('balance_in_cents').first();
  return res.status(200).json({
    circulation: result.sum,
  });
});
