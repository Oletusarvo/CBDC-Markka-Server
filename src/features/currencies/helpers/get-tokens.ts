import { db } from '../../../db-config';
import { tablenames } from '../../../tablenames';
import { DBContext } from '../../../types/db-context';

export function getTokens(ctx: DBContext) {
  return ctx(tablenames.currencyObjects)
    .leftJoin(tablenames.denomTypes, 'denom_type.id', 'currency_object.denom_type_id')
    .select(
      'currency_object.id',
      'currency_object.minted_on',
      db.raw('CAST(denom_type.value_in_cents as INT) as value_in_cents'),
    );
}
