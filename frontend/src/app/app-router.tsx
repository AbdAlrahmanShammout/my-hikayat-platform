import { createBrowserRouter, Navigate } from 'react-router';

import { AdminRouteGuard } from '@/app/admin-route-guard';
import { AdminAuditPage } from '@/pages/admin/audit-page';
import { AdminBooksPage } from '@/pages/admin/books-page';
import { AdminCategoriesPage } from '@/pages/admin/categories-page';
import { AdminCollectionsPage } from '@/pages/admin/collections-page';
import { AdminHomePage } from '@/pages/admin/home-page';
import { AdminRevenuePage } from '@/pages/admin/revenue-page';
import { AdminSubscriptionsPage } from '@/pages/admin/subscriptions-page';
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
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'subscriptions', element: <AdminSubscriptionsPage /> },
      { path: 'collections', element: <AdminCollectionsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'revenue', element: <AdminRevenuePage /> },
      { path: 'audit', element: <AdminAuditPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
