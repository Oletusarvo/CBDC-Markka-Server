import { db } from '../../../db-config';
import { createHandler } from '../../../utils/create-handler';
import { getTokens } from '../helpers/get-tokens';

export const getCirculation = createHandler(async (req, res) => {
  const result = await db('currency_object')
    .leftJoin(
      'currency_denom_type',
      'currency_denom_type.id',
      'currency_object.currency_denom_type_id',
    )
    .whereNotNull('currency_object.account_id')
    .sum('currency_denom_type.value_in_cents as circulation')
    .first();

  return res.status(200).json({
    circulation: result?.circulation ?? 0,
  });
});
