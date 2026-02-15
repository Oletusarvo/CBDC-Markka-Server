import { createMiddleware } from '../../../utils/create-handler';
import { getAccessToken } from '../util/get-access-token';

export const includeAuth = createMiddleware(async (req, res, next) => {
  const token = getAccessToken(req);
  if (token) {
    //Decode the token and include the session as part of the request.
  }
});
