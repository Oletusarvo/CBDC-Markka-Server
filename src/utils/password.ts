import bcrypt from 'bcrypt';

export async function hashPassword(password: string) {
  const rounds = process.env.PASSWORD_HASH_ROUNDS;
  return await bcrypt.hash(password, rounds ? parseInt(rounds) : 15);
}

export async function verifyPassword(password: string, encrypted: string) {
  return await bcrypt.compare(password, encrypted);
}
