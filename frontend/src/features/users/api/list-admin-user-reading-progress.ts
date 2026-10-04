import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type AdminReadingProgressPage = {
  readonly readingProgress: Array<components['schemas']['AdminUserReadingProgressItemResponse']>;
  readonly total: number;
};

export type ListAdminUserReadingProgressQuery = {
  readonly limit?: number;
  readonly offset?: number;
};

/**
 * Loads one page of saved reading progress. Position fields stay as the API returns them.
 */
export async function listAdminUserReadingProgress(
  userId: number,
  query: ListAdminUserReadingProgressQuery,
): Promise<AdminReadingProgressPage> {
  return requestJson<AdminReadingProgressPage>({
    path: `/admin/users/${userId}/reading-progress${toSearchParams(query)}`,
    method: 'GET',
  });
}
