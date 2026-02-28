import z from 'zod';
import { ExpressRequest } from '../../../types/express';

import { userSchema } from '../schemas/register-user-schema';
import { createHandler } from '../../../utils/create-handler';
import { db } from '../../../db-config';
import { hashPassword } from '../../../utils/password';
import { containsExactly, mint, pick } from '../../currencies/util/currency-util';
import { tablenames } from '../../../tablenames';
import { getTokens } from '../../currencies/helpers/get-tokens';

const MAX_SUPPLY_IN_CENTS = 110_000_000_000;

export const registerUserHandler = createHandler(
  async (req: ExpressRequest<z.infer<typeof userSchema>>, res) => {
    const credentials = req.data;
    await db.transaction(async trx => {
      const [user] = await trx(tablenames.users)
        .insert({
          email: credentials.email,
          password: await hashPassword(credentials.password1),
        })
        .returning('id');

      const [acc] = await trx(tablenames.accounts)
        .insert({
          user_id: user.id,
        })
        .returning('id');

      const currentSupplyInCents = await trx(tablenames.currencyObjects)
        .leftJoin(tablenames.denomTypes, 'denom_type.id', 'currency_object.denom_type_id')
        .whereNotNull('currency_object.account_id')
        .sum('denom_type.value_in_cents as total')
        .first();

      if (currentSupplyInCents.total + 2000 > MAX_SUPPLY_IN_CENTS) {
        return;
      }

      const reserveTokens = await trx(tablenames.currencyObjects)
        .whereNull('account_id')
        .whereIn(
          'denom_type_id',
          trx.select('id').from(tablenames.denomTypes).where('value_in_cents', '<=', 2000),
        )
        .forUpdate()
        .skipLocked()
        .limit(200);

      if (reserveTokens.length > 0 && containsExactly(reserveTokens, 2000)) {
        //Give the unassigned tokens to the new user.
        const tokens = pick(reserveTokens, 2000);
        await trx(tablenames.currencyObjects)
          .whereIn(
            'id',
            tokens.map(t => t.id),
          )
          .update(
            tokens.map(t => {
              return {
                ...t,
                account_id: acc.id,
              };
            }),
          );
      } else {
        //Mint new tokens to give to the user
        const mintedTokens = mint(2000);
        await Promise.all(
          mintedTokens.map(async t => {
            await trx(tablenames.currencyObjects).insert({
              account_id: acc.id,
              denom_type_id: trx
                .select('id')
                .from(tablenames.denomTypes)
                .where({ value_in_cents: t })
                .limit(1),
            });
          }),
        );
      }
    });
    return res.status(200).end();
  },
  (err, res) => {
    const msg = err.message.toLowerCase() as string;
    if (msg.includes('duplicate')) {
      if (msg.includes('user_email')) {
        return res.status(409).json({
          error: 'auth:email-taken',
        });
      }
    }
  },
);
