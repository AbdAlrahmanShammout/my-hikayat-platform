import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Soft-deletes a managed user.
 */
export async function deleteAdminUser(
  userId: number,
): Promise<components['schemas']['UserResponse']> {
  return requestJson<components['schemas']['UserResponse']>({
    path: `/admin/users/${userId}`,
    method: 'DELETE',
  });
}
