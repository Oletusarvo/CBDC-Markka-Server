import { loadEnvVariable } from './load-env-variable';
import jwt from 'jsonwebtoken';

export function verifyJWT(token: string) {
  const secret = loadEnvVariable('TOKEN_SECRET');
  return jwt.verify(token, secret);
}
