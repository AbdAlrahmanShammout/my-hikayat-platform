import { z } from 'zod';

import { PASSWORD_LENGTH } from '@/config/password-length';

export const registerAuthorFormSchema = z
  .object({
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    password: z
      .string()
      .min(PASSWORD_LENGTH.min, `Use at least ${PASSWORD_LENGTH.min} characters`)
      .max(PASSWORD_LENGTH.max, `Use at most ${PASSWORD_LENGTH.max} characters`),
    confirmPassword: z.string().min(1, 'Confirm the password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type RegisterAuthorFormValues = z.infer<typeof registerAuthorFormSchema>;
