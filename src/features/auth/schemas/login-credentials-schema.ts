import z from 'zod';

export const loginCredentialsSchema = z.object({
  email: z.string().trim(),
  password: z.string().trim(),
});
