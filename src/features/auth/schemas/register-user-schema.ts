import z from 'zod';
import { passwordSchema } from './password-schema';

export const userSchema = z
  .object({
    email: z
      .email()
      .trim()
      .refine(
        email => {
          const domain = email.split('@').at(1);
          return domain === 'gmail.com';
        },
        { error: 'auth:invalid_email_domain' },
      ),
    password1: passwordSchema,
    password2: z.string(),
  })
  .refine(user => user.password1 === user.password2, { error: 'Passwords do not match!' });
