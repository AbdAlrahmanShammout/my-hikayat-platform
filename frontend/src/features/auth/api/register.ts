import { requestJson } from '@/api/request-json';
import type { AuthSession } from '@/features/auth/api/auth-session';
import type { components } from '@/generated/author';

export type RegisterRequest = components['schemas']['RegisterRequestDto'];

/**
 * Creates a reader account. Publisher capability is a separate POST /user/publisher.
 */
export async function register(input: RegisterRequest): Promise<AuthSession> {
  return requestJson<AuthSession>({
    path: '/auth/register',
    method: 'POST',
    body: input,
  });
}
