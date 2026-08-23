import { requestJson } from '@/api/client';
import type { AuthSession, RegisterRequest } from '@/features/auth/auth.types';

/**
 * Creates a reader account and returns a Bearer session.
 */
export async function register(input: RegisterRequest): Promise<AuthSession> {
  return requestJson<AuthSession>({
    path: '/auth/register',
    method: 'POST',
    body: input,
  });
}
