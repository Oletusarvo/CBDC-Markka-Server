import { serverConfig } from '../../../../server-config';
import { db } from '../../../db-config';
import { ExpressRequest } from '../../../types/express';
import { createHandler } from '../../../utils/create-handler';
import { createJWT } from '../../../utils/jwt';
import { verifyPassword } from '../../../utils/password';

export const loginHandler = createHandler(
  async (req: ExpressRequest<{ email: string; password: string }>, res) => {
    const credentials = req.body;
    const user = await db('user')
      .where({ email: credentials.email })
      .select('password', 'id', 'email')
      .first();

    if (!user) {
      return res.status(404).json({
        error: 'auth:not-found',
      });
    }

    const passwordOk = await verifyPassword(credentials.password, user.password);
    if (!passwordOk) {
      return res.status(401).json({
        error: 'auth:invalid-password',
      });
    }

    const token = createJWT({
      id: user.id,
      email: user.email,
    });

    return res
      .status(200)
      .cookie(serverConfig.accessTokenName, token, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: true,
      })
      .json({
        token,
      });
  },
);
