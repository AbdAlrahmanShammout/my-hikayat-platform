import { requestJson } from '@/api/request-json';

/**
 * Revokes a refresh token on the server.
 */
export async function logoutSession(refreshToken: string): Promise<void> {
  await requestJson<void>({
    path: '/auth/logout',
    method: 'POST',
    body: { refreshToken },
    skipAuthRefresh: true,
  });
}
