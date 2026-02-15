import { AuthenticatedExpressRequest } from '../../../types/express';
import { createHandler } from '../../../utils/create-handler';

export const getSessionHandler = createHandler(async (req: AuthenticatedExpressRequest, res) => {
  return res.status(200).json(req.session);
});
