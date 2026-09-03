import { createHash } from 'node:crypto';

/**
 * Builds a short fingerprint of the current password hash for one-time recovery tokens.
 */
export function buildPasswordFingerprint(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('hex').slice(0, 32);
}
