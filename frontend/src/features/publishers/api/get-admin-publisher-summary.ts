import { requestJson } from '@/api/request-json';

export type AdminPublisherSummary = {
  readonly id: number;
  readonly email: string;
  readonly displayName: string | null;
  readonly role: string;
  readonly isPublisher: boolean;
  readonly createdAt: string;
  readonly total: number;
  readonly catalogVisible: number;
  readonly unpublishedApprovedCount: number;
  readonly publishingStatusCounts: readonly {
    readonly publishingStatus: string;
    readonly count: number;
  }[];
  readonly lifetimeAuthorCents: number;
  readonly recentBooks: readonly {
    readonly id: number;
    readonly title: string;
    readonly publishingStatus: string;
    readonly authorName: string | null;
    readonly publisherName: string | null;
  }[];
  readonly revenuePeriodLinks: readonly number[];
};

/**
 * Loads publisher-account totals from GET /admin/publishers/:userId/summary.
 */
export async function getAdminPublisherSummary(userId: number): Promise<AdminPublisherSummary> {
  return requestJson<AdminPublisherSummary>({
    path: `/admin/publishers/${userId}/summary`,
    method: 'GET',
  });
}
