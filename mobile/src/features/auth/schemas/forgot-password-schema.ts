import { z } from 'zod';

/**
 * Client UX schema for forgot-password email. Backend remains authoritative.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email.'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
