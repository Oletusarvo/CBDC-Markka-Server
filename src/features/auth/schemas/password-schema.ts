import z from 'zod';

export const passwordSchema = z
  .string()
  .refine(
    pass => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(pass),
    'Passwords must have upper- and lowecase letters, numbers and special characters!'
  );
