import { createBrowserRouter, Navigate } from 'react-router';

import { AdminRouteGuard } from '@/app/admin-route-guard';
import { AdminAuditPage } from '@/pages/admin/audit-page';
import { AdminBookDetailPage } from '@/pages/admin/book-detail-page';
import { AdminBooksPage } from '@/pages/admin/books-page';
import { AdminCategoriesPage } from '@/pages/admin/categories-page';
import { AdminCollectionDetailPage } from '@/pages/admin/collection-detail-page';
import { AdminCollectionsPage } from '@/pages/admin/collections-page';
import { AdminHomePage } from '@/pages/admin/home-page';
import { AdminRevenueDetailPage } from '@/pages/admin/revenue-detail-page';
import { AdminRevenuePage } from '@/pages/admin/revenue-page';
import { AdminSubscriptionDetailPage } from '@/pages/admin/subscription-detail-page';
import { AdminSubscriptionsPage } from '@/pages/admin/subscriptions-page';
import { AdminUserDetailPage } from '@/pages/admin/user-detail-page';
import { AdminUsersPage } from '@/pages/admin/users-page';
import { LoginPage } from '@/pages/login-page';
import { NotFoundPage } from '@/pages/not-found-page';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <AdminRouteGuard />,
    children: [
      { index: true, element: <AdminHomePage /> },
      { path: 'books', element: <AdminBooksPage /> },
      { path: 'books/:bookId', element: <AdminBookDetailPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'users/:userId', element: <AdminUserDetailPage /> },
      { path: 'subscriptions', element: <AdminSubscriptionsPage /> },
      { path: 'subscriptions/:subscriptionId', element: <AdminSubscriptionDetailPage /> },
      { path: 'collections', element: <AdminCollectionsPage /> },
      { path: 'collections/:collectionId', element: <AdminCollectionDetailPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'revenue', element: <AdminRevenuePage /> },
      { path: 'revenue/:revenuePeriodId', element: <AdminRevenueDetailPage /> },
      { path: 'audit', element: <AdminAuditPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
