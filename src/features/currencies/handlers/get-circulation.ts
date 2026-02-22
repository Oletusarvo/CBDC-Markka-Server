import { db } from '../../../db-config';
import { tablenames } from '../../../tablenames';
import { createHandler } from '../../../utils/create-handler';

/**Returns the total quantity of tokens in circulation. */
export const getCirculation = createHandler(async (req, res) => {
  const result = await db(tablenames.currencyObjects)
    .leftJoin(tablenames.denomTypes, 'denom_type.id', 'currency_object.denom_type_id')
    .whereNotNull('currency_object.account_id')
    .sum('denom_type.value_in_cents as circulation')
    .first();

  return res.status(200).json({
    circulation: result?.circulation ?? 0,
  });
});
