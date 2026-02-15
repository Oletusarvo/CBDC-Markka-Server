import { db } from '../../../db-config';
import { AuthenticatedExpressRequest } from '../../../types/express';
import { createHandler } from '../../../utils/create-handler';
import { hashPassword } from '../../../utils/password';

/**Creates a new account for the authenticated user. */
export const createAccount = createHandler(
  async (req: AuthenticatedExpressRequest, res) => {
    return res.status(200).end();
  },
  (err, res) => {
    return res.status(500).end();
  },
);
