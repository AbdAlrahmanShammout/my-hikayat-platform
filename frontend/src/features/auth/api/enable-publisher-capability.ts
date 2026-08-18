import { requestJson } from '@/api/request-json';
import type { AuthSession } from '@/features/auth/api/auth-session';

/**
 * Enables publisher capability. A reader becomes an author. The API remains authoritative.
 */
export async function enablePublisherCapability(accessToken?: string): Promise<AuthSession> {
  return requestJson<AuthSession>({
    path: '/user/publisher',
    method: 'POST',
    accessToken,
  });
}
