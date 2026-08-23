import { requestJson } from '@/api/client';
import type { AuthSession, LoginRequest } from '@/features/auth/auth.types';

/**
 * Signs in with email and password. Returns a Bearer access token and principal.
 */
export async function login(input: LoginRequest): Promise<AuthSession> {
  return requestJson<AuthSession>({
    path: '/auth/login',
    method: 'POST',
    body: input,
  });
}
