import { serverConfig } from '../../../../server-config';
import { ExpressRequest } from '../../../types/express';

export function getAccessToken(req: ExpressRequest) {
  //First try the cookie.
  let token = req.cookies[serverConfig.accessTokenName];

  if (!token) {
    //Access token not present as a cookie. Check authorization header.
    token = req.headers.authorization?.split(' ').at(1);
  }
  return token;
}
