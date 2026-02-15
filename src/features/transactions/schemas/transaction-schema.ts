import z from 'zod';

export const transactionSchema = z.object({
  email: z.string(),
  amt: z
    .string()
    .transform(val => parseFloat(val))
    .pipe(z.number()),
  message: z.string().optional(),
});
