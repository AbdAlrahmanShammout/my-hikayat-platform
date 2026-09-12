import { z } from 'zod';

import { authCredentialsSchema } from '@/features/auth/schemas/auth-credentials-schema';

const DISPLAY_NAME_MAX_LENGTH = 80;

/**
 * Client UX schema for reader registration. Backend validation remains authoritative.
 */
export const registerCredentialsSchema = authCredentialsSchema.extend({
  displayName: z
    .string()
    .trim()
    .min(1, 'Enter the name we should greet you with.')
    .max(DISPLAY_NAME_MAX_LENGTH, `Use at most ${DISPLAY_NAME_MAX_LENGTH} characters.`),
});

export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;
