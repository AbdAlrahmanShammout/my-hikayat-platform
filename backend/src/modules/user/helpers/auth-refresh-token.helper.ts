import { createHash, randomBytes } from 'node:crypto';

import { AUTH_REFRESH_TOKEN } from '@/modules/user/consts/auth-refresh-token.constant';

export function createAuthRefreshTokenJti(): string {
  return randomBytes(AUTH_REFRESH_TOKEN.jtiByteLength).toString('base64url');
}

export function hashAuthRefreshTokenJti(jti: string): string {
  return createHash('sha256').update(jti).digest('hex');
}
