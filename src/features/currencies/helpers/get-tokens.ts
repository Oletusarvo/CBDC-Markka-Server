import { DBContext } from '../../../types/db-context';

export function getTokens(ctx: DBContext) {
  return ctx('currency_object')
    .leftJoin(
      ctx
        .select('value_in_cents', 'id')
        .from('currency_denom_type')
        .groupBy('id')
        .as('currency_denom_type'),
      'currency_denom_type.id',
      'currency_object.currency_denom_type_id',
    )
    .select(
      'currency_object.id',
      'currency_object.minted_on',
      'currency_denom_type.value_in_cents as value_in_cents',
    );
}
