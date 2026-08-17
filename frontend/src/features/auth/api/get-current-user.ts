import { requestJson } from '@/api/request-json';
import type { User } from '@/types/user';

/**
 * Loads the authenticated principal from GET /auth/me.
 */
export async function getCurrentUser(): Promise<User> {
  return requestJson<User>({
    path: '/auth/me',
    method: 'GET',
  });
}
