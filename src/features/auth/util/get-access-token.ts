import { serverConfig } from '../../../../server-config';
import { ExpressRequest } from '../../../types/express';

export function getAccessToken(req: ExpressRequest) {
  return req.cookies[serverConfig.accessTokenName];
}
