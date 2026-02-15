import jwt from 'jsonwebtoken';

const getSecret = () => process.env.TOKEN_SECRET;

export function createJWT<T extends Record<string, unknown>>(
  payload: T,
  options?: jwt.SignOptions
) {
  return jwt.sign(payload, getSecret(), options);
}

export function verifyJWT(token: string) {
  return jwt.verify(token, getSecret());
}
