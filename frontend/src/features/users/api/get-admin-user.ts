import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type AdminUserDetailResponse = components['schemas']['GetAdminUserDetailResponseDto'] & {
  readonly readingProgressTotal: number;
};

/**
 * Loads one user for administrative management, including subscription and reading progress.
 */
export async function getAdminUser(userId: number): Promise<AdminUserDetailResponse> {
  return requestJson<AdminUserDetailResponse>({
    path: `/admin/users/${userId}`,
    method: 'GET',
  });
}
