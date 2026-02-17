import z from 'zod';
import { ExpressRequest } from '../../../types/express';

import { userSchema } from '../schemas/register-user-schema';
import { createHandler } from '../../../utils/create-handler';
import { db } from '../../../db-config';
import { hashPassword } from '../../../utils/password';
import { containsExactly, mint, pick } from '../../currencies/util/currency-util';

export const registerUserHandler = createHandler(
  async (req: ExpressRequest<z.infer<typeof userSchema>>, res) => {
    const credentials = req.data;
    await db.transaction(async trx => {
      const [user] = await trx('user')
        .insert({
          email: credentials.email,
          password: await hashPassword(credentials.password1),
        })
        .returning('id');

      const [acc] = await trx('account')
        .insert({
          user_id: user.id,
        })
        .returning('id');

      const reserveTokens = await trx('currency_object')
        .whereNull('account_id')
        .whereIn(
          'currency_denom_type_id',
          trx.select('id').from('currency_denom_type').where('value_in_cents', '<=', 2000),
        )
        .forUpdate()
        .skipLocked()
        .limit(200);

      if (reserveTokens.length > 0 && containsExactly(reserveTokens, 2000)) {
        //Give the unassigned tokens to the new user.
        const tokens = pick(reserveTokens, 2000);
        await trx('currency_object')
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
            await trx('currency_object').insert({
              account_id: acc.id,
              currency_denom_type_id: trx
                .select('id')
                .from('currency_denom_type')
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
