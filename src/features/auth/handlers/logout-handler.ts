import { serverConfig } from '../../../../server-config';
import { createHandler } from '../../../utils/create-handler';

export const logoutHandler = createHandler(async (req, res) => {
  res.clearCookie(serverConfig.accessTokenName);
  return res.status(200).end();
});
