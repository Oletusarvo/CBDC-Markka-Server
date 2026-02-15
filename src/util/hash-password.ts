import { loadEnvVariable } from './load-env-variable';
import bcrypt from 'bcrypt';

export async function hashPassword(pass: string) {
  const rounds = loadEnvVariable('PASSWORD_HASH_ROUNDS', false);
  return await bcrypt.hash(pass, rounds ? parseInt(rounds) : 15);
}
