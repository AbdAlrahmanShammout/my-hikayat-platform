import type { JSX } from 'react';
import { Navigate } from 'react-router';

import { AuthorShell } from '@/app/author-shell';
import { PageSkeleton } from '@/components/page-skeleton';
import { CurrentUserLoadError } from '@/features/auth/components/current-user-load-error';
import { ForbiddenPanel } from '@/features/auth/components/forbidden-panel';
import { useAccessToken } from '@/features/auth/hooks/use-access-token';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { canAccessAuthorDashboard } from '@/features/auth/lib/can-access-author-dashboard';

/**
 * UX-only author gate. Backend Roles(AUTHOR, ADMIN) remains the security authority.
 */
export function AuthorRouteGuard(): JSX.Element {
  const accessToken: string | null = useAccessToken();
  const currentUserQuery = useCurrentUser();
  if (accessToken === null) {
    return <Navigate to="/login" replace />;
  }
  if (currentUserQuery.isPending) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <PageSkeleton />
      </div>
    );
  }
  if (currentUserQuery.isError) {
    return (
      <CurrentUserLoadError
        error={currentUserQuery.error}
        onRetry={() => {
          void currentUserQuery.refetch();
        }}
      />
    );
  }
  if (!canAccessAuthorDashboard(currentUserQuery.data.role)) {
    return (
      <ForbiddenPanel
        title="Author access required"
        description="This dashboard is for authors. Administrators may also open it. Your account does not have access."
      />
    );
  }
  return <AuthorShell />;
}
