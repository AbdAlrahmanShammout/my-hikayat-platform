import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Loads one user for administrative management.
 */
export async function getAdminUser(
  userId: number,
): Promise<components['schemas']['UserResponse']> {
  return requestJson<components['schemas']['UserResponse']>({
    path: `/admin/users/${userId}`,
    method: 'GET',
  });
}
