import { requestJson } from '@/api/client';
import type { User } from '@/session/session.types';

/**
 * Loads the authenticated principal for the current Bearer token.
 */
export async function getCurrentUser(): Promise<User> {
  return requestJson<User>({
    path: '/auth/me',
    method: 'GET',
  });
}
