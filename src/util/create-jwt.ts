import jwt from 'jsonwebtoken';
import { loadEnvVariable } from './load-env-variable';

export function createJWT(payload: Record<string, unknown>, options?: jwt.SignOptions) {
  const secret = loadEnvVariable('TOKEN_SECRET');
  return jwt.sign(payload, secret, options);
}
