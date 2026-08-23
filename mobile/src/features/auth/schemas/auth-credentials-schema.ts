import { z } from 'zod';

/**
 * Client UX schema for email/password. Backend validation remains authoritative.
 */
export const authCredentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password must be at most 72 characters.'),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
