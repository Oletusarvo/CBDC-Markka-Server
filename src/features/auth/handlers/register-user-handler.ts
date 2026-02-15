import z from 'zod';
import { ExpressRequest } from '../../../types/express';

import { userSchema } from '../schemas/register-user-schema';
import { createHandler } from '../../../utils/create-handler';
import { db } from '../../../db-config';
import { hashPassword } from '../../../utils/password';

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

      await trx('account').insert({
        user_id: user.id,
      });
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
