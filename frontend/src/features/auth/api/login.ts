import { requestJson } from '@/api/request-json';
import type { AuthSession } from '@/features/auth/api/auth-session';
import type { components } from '@/generated/admin';

export type LoginRequest = components['schemas']['LoginRequestDto'];

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
