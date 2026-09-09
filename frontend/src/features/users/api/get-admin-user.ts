import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Loads one user for administrative management, including subscription and reading progress.
 */
export async function getAdminUser(
  userId: number,
): Promise<components['schemas']['GetAdminUserDetailResponseDto']> {
  return requestJson<components['schemas']['GetAdminUserDetailResponseDto']>({
    path: `/admin/users/${userId}`,
    method: 'GET',
  });
}
