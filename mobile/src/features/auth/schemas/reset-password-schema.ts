import { z } from 'zod';

/**
 * Client UX schema for reset-password. Backend remains authoritative.
 */
export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Paste the reset token from your email.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password must be at most 72 characters.'),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
