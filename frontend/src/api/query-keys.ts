import type { paths } from '@/generated/admin';
import type { paths as AuthorPaths } from '@/generated/author';

type AdminBooksListQuery = NonNullable<paths['/admin/books']['get']['parameters']['query']>;
type AdminUsersListQuery = NonNullable<paths['/admin/users']['get']['parameters']['query']>;
type AdminSubscriptionsListQuery = NonNullable<
  paths['/admin/subscriptions']['get']['parameters']['query']
>;
type AdminRevenuePeriodsListQuery = NonNullable<
  paths['/admin/revenue-periods']['get']['parameters']['query']
>;
type AdminPeriodEarningsQuery = NonNullable<
  paths['/admin/revenue-periods/{id}/earnings']['get']['parameters']['query']
>;
type AdminPeriodAnalyticsQuery = NonNullable<
  paths['/admin/revenue-periods/{id}/analytics']['get']['parameters']['query']
>;
type AdminCategoriesListQuery = NonNullable<
  paths['/admin/categories']['get']['parameters']['query']
>;
type AdminCollectionsListQuery = NonNullable<
  paths['/admin/collections']['get']['parameters']['query']
>;
type AdminAuditLogsListQuery = NonNullable<
  paths['/admin/audit-logs']['get']['parameters']['query']
>;
type AdminInvitationsListQuery = NonNullable<
  paths['/admin/invitations']['get']['parameters']['query']
>;
type AdminBookRejectionHistoryQuery = NonNullable<
  paths['/admin/books/{id}/rejection-history']['get']['parameters']['query']
>;
type AuthorBooksListQuery = NonNullable<AuthorPaths['/author/books']['get']['parameters']['query']>;
type AuthorBookRejectionHistoryQuery = NonNullable<
  AuthorPaths['/author/books/{id}/rejection-history']['get']['parameters']['query']
>;
type AuthorCategoriesListQuery = NonNullable<
  AuthorPaths['/author/categories']['get']['parameters']['query']
>;
type AuthorAnalyticsQuery = NonNullable<
  AuthorPaths['/author/analytics']['get']['parameters']['query']
>;
type AuthorEarningsTrendQuery = NonNullable<
  AuthorPaths['/author/earnings/trend']['get']['parameters']['query']
>;
type AuthorEarningsQuery = NonNullable<
  AuthorPaths['/author/earnings']['get']['parameters']['query']
>;

/**
 * Feature-scoped TanStack Query keys. Keep mutations invalidating the smallest set.
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  admin: {
    books: {
      all: ['admin', 'books'] as const,
      list: (filters: AdminBooksListQuery) =>
        [...queryKeys.admin.books.all, 'list', filters] as const,
      detail: (bookId: number) => [...queryKeys.admin.books.all, 'detail', bookId] as const,
      rejectionHistory: (bookId: number, filters: AdminBookRejectionHistoryQuery) =>
        [...queryKeys.admin.books.all, 'rejection-history', bookId, filters] as const,
    },
    categories: {
      all: ['admin', 'categories'] as const,
      list: (filters: AdminCategoriesListQuery) =>
        [...queryKeys.admin.categories.all, 'list', filters] as const,
    },
    users: {
      all: ['admin', 'users'] as const,
      list: (filters: AdminUsersListQuery) =>
        [...queryKeys.admin.users.all, 'list', filters] as const,
      detail: (userId: number) => [...queryKeys.admin.users.all, 'detail', userId] as const,
    },
    invitations: {
      all: ['admin', 'invitations'] as const,
      list: (filters: AdminInvitationsListQuery) =>
        [...queryKeys.admin.invitations.all, 'list', filters] as const,
    },
    subscriptions: {
      all: ['admin', 'subscriptions'] as const,
      list: (filters: AdminSubscriptionsListQuery) =>
        [...queryKeys.admin.subscriptions.all, 'list', filters] as const,
      detail: (subscriptionId: number) =>
        [...queryKeys.admin.subscriptions.all, 'detail', subscriptionId] as const,
    },
    collections: {
      all: ['admin', 'collections'] as const,
      list: (filters: AdminCollectionsListQuery) =>
        [...queryKeys.admin.collections.all, 'list', filters] as const,
      detail: (collectionId: number) =>
        [...queryKeys.admin.collections.all, 'detail', collectionId] as const,
    },
    revenuePeriods: {
      all: ['admin', 'revenue-periods'] as const,
      list: (filters: AdminRevenuePeriodsListQuery) =>
        [...queryKeys.admin.revenuePeriods.all, 'list', filters] as const,
      detail: (revenuePeriodId: number) =>
        [...queryKeys.admin.revenuePeriods.all, 'detail', revenuePeriodId] as const,
      earnings: (revenuePeriodId: number, filters: AdminPeriodEarningsQuery) =>
        [...queryKeys.admin.revenuePeriods.all, revenuePeriodId, 'earnings', filters] as const,
      analytics: (revenuePeriodId: number, filters: AdminPeriodAnalyticsQuery) =>
        [...queryKeys.admin.revenuePeriods.all, revenuePeriodId, 'analytics', filters] as const,
      heatmap: (revenuePeriodId: number, bookId: number) =>
        [...queryKeys.admin.revenuePeriods.all, revenuePeriodId, 'heatmap', bookId] as const,
    },
    auditLogs: {
      all: ['admin', 'audit-logs'] as const,
      list: (filters: AdminAuditLogsListQuery) =>
        [...queryKeys.admin.auditLogs.all, 'list', filters] as const,
      detail: (auditLogId: number) =>
        [...queryKeys.admin.auditLogs.all, 'detail', auditLogId] as const,
    },
    dashboard: {
      all: ['admin', 'dashboard'] as const,
      summary: () => [...queryKeys.admin.dashboard.all, 'summary'] as const,
    },
  },
  author: {
    books: {
      all: ['author', 'books'] as const,
      list: (filters: AuthorBooksListQuery) =>
        [...queryKeys.author.books.all, 'list', filters] as const,
      detail: (bookId: number) => [...queryKeys.author.books.all, 'detail', bookId] as const,
      rejectionHistory: (bookId: number, filters: AuthorBookRejectionHistoryQuery) =>
        [...queryKeys.author.books.all, 'rejection-history', bookId, filters] as const,
    },
    categories: {
      all: ['author', 'categories'] as const,
      list: (filters: AuthorCategoriesListQuery) =>
        [...queryKeys.author.categories.all, 'list', filters] as const,
    },
    analytics: {
      all: ['author', 'analytics'] as const,
      list: (filters: AuthorAnalyticsQuery) =>
        [...queryKeys.author.analytics.all, 'list', filters] as const,
      heatmap: (bookId: number, revenuePeriodId: number) =>
        [...queryKeys.author.analytics.all, 'heatmap', bookId, revenuePeriodId] as const,
    },
    earnings: {
      all: ['author', 'earnings'] as const,
      trend: (filters: AuthorEarningsTrendQuery) =>
        [...queryKeys.author.earnings.all, 'trend', filters] as const,
      list: (filters: AuthorEarningsQuery) =>
        [...queryKeys.author.earnings.all, 'list', filters] as const,
    },
    dashboard: {
      all: ['author', 'dashboard'] as const,
      summary: () => [...queryKeys.author.dashboard.all, 'summary'] as const,
    },
  },
} as const;
