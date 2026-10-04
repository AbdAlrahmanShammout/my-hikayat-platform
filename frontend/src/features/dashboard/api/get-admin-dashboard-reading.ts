import { requestJson } from '@/api/request-json';
import { toSearchParams } from '@/lib/to-search-params';

export type AdminDashboardReadingBook = {
  readonly bookId: number;
  readonly title: string;
  readonly ownerId: number;
  readonly activeReadingMs: number;
  readonly activeSpreadMs: number;
  readonly readingMinutes: number;
};

export type AdminDashboardReading = {
  readonly totalReadingMinutes: number;
  readonly bookEngagements: readonly AdminDashboardReadingBook[];
  readonly total: number;
};

export type AdminDashboardReadingQuery = {
  readonly limit?: number;
  readonly offset?: number;
  readonly ownerId?: number;
};

/**
 * Loads the reading drill-down. totalReadingMinutes is the API total, not a sum of this page.
 */
export async function getAdminDashboardReading(
  query: AdminDashboardReadingQuery = {},
): Promise<AdminDashboardReading> {
  return requestJson<AdminDashboardReading>({
    path: `/admin/dashboard/reading${toSearchParams(query)}`,
    method: 'GET',
  });
}
