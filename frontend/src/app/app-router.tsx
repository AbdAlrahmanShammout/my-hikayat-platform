import { createBrowserRouter, Navigate } from 'react-router';

import { AdminRouteGuard } from '@/app/admin-route-guard';
import { AuthorRouteGuard } from '@/app/author-route-guard';
import { ADMIN_INVITATION_ACCEPT_PATH } from '@/config/admin-invitation-accept-path';
import { AcceptAdminInvitationPage } from '@/pages/accept-admin-invitation-page';
import { AdminAuditDetailPage } from '@/pages/admin/audit-detail-page';
import { AdminAuditPage } from '@/pages/admin/audit-page';
import { AdminBookDetailPage } from '@/pages/admin/book-detail-page';
import { AdminBooksPage } from '@/pages/admin/books-page';
import { AdminCategoriesPage } from '@/pages/admin/categories-page';
import { AdminCollectionDetailPage } from '@/pages/admin/collection-detail-page';
import { AdminCollectionsPage } from '@/pages/admin/collections-page';
import { AdminExportsPage } from '@/pages/admin/exports-page';
import { AdminHomePage } from '@/pages/admin/home-page';
import { AdminInvitationsPage } from '@/pages/admin/invitations-page';
import { AdminPlansPage } from '@/pages/admin/plans-page';
import { AdminPlatformSettingsPage } from '@/pages/admin/platform-settings-page';
import { AdminPublisherSummaryPage } from '@/pages/admin/publisher-summary-page';
import { AdminPublishersPage } from '@/pages/admin/publishers-page';
import { AdminReadingPage } from '@/pages/admin/reading-page';
import { AdminRevenueDetailPage } from '@/pages/admin/revenue-detail-page';
import { AdminRevenuePeriodBookHeatmapPage } from '@/pages/admin/revenue-period-book-heatmap-page';
import { AdminRevenuePage } from '@/pages/admin/revenue-page';
import { AdminSubscriptionDetailPage } from '@/pages/admin/subscription-detail-page';
import { AdminSearchPage } from '@/pages/admin/search-page';
import { AdminSubscriptionsPage } from '@/pages/admin/subscriptions-page';
import { AdminUserDetailPage } from '@/pages/admin/user-detail-page';
import { AdminUsersPage } from '@/pages/admin/users-page';
import { AuthorAnalyticsPage } from '@/pages/author/analytics-page';
import { AuthorBookDetailPage } from '@/pages/author/book-detail-page';
import { AuthorBookHeatmapPage } from '@/pages/author/book-heatmap-page';
import { AuthorBooksPage } from '@/pages/author/books-page';
import { AuthorEarningsPage } from '@/pages/author/earnings-page';
import { AuthorHomePage } from '@/pages/author/home-page';
import { LoginPage } from '@/pages/login-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { RegisterPage } from '@/pages/register-page';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: ADMIN_INVITATION_ACCEPT_PATH,
    element: <AcceptAdminInvitationPage />,
  },
  {
    path: '/admin',
    element: <AdminRouteGuard />,
    children: [
      { index: true, element: <AdminHomePage /> },
      { path: 'books', element: <AdminBooksPage /> },
      { path: 'books/:bookId', element: <AdminBookDetailPage /> },
      { path: 'users', element: <Navigate to="/admin/users/members" replace /> },
      { path: 'users/admins', element: <AdminUsersPage /> },
      { path: 'users/members', element: <AdminUsersPage /> },
      { path: 'users/:userId', element: <AdminUserDetailPage /> },
      { path: 'invitations', element: <AdminInvitationsPage /> },
      { path: 'publishers', element: <AdminPublishersPage /> },
      { path: 'publishers/:userId', element: <AdminPublisherSummaryPage /> },
      { path: 'reading', element: <AdminReadingPage /> },
      { path: 'exports', element: <AdminExportsPage /> },
      { path: 'search', element: <AdminSearchPage /> },
      { path: 'plans', element: <AdminPlansPage /> },
      { path: 'subscriptions', element: <AdminSubscriptionsPage /> },
      { path: 'subscriptions/:subscriptionId', element: <AdminSubscriptionDetailPage /> },
      { path: 'collections', element: <AdminCollectionsPage /> },
      { path: 'collections/:collectionId', element: <AdminCollectionDetailPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'settings', element: <AdminPlatformSettingsPage /> },
      { path: 'revenue', element: <AdminRevenuePage /> },
      { path: 'revenue/:revenuePeriodId', element: <AdminRevenueDetailPage /> },
      {
        path: 'revenue/:revenuePeriodId/books/:bookId/heatmap',
        element: <AdminRevenuePeriodBookHeatmapPage />,
      },
      { path: 'audit', element: <AdminAuditPage /> },
      { path: 'audit/:auditLogId', element: <AdminAuditDetailPage /> },
    ],
  },
  {
    path: '/author',
    element: <AuthorRouteGuard />,
    children: [
      { index: true, element: <AuthorHomePage /> },
      { path: 'books', element: <AuthorBooksPage /> },
      { path: 'books/:bookId', element: <AuthorBookDetailPage /> },
      { path: 'analytics', element: <AuthorAnalyticsPage /> },
      { path: 'analytics/books/:bookId/heatmap', element: <AuthorBookHeatmapPage /> },
      { path: 'earnings', element: <AuthorEarningsPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
