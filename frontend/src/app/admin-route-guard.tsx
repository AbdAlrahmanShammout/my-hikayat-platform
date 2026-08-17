import type { JSX } from 'react';
import { Navigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { AdminShell } from '@/app/admin-shell';
import { ErrorState } from '@/components/error-state';
import { PageSkeleton } from '@/components/page-skeleton';
import { ForbiddenPanel } from '@/features/auth/components/forbidden-panel';
import { useAccessToken } from '@/features/auth/hooks/use-access-token';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { USER_ROLES } from '@/types/user-role';

/**
 * UX-only admin gate. Backend Roles(ADMIN) remains the security authority.
 */
export function AdminRouteGuard(): JSX.Element {
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
    return renderCurrentUserError(currentUserQuery.error, () => {
      void currentUserQuery.refetch();
    });
  }
  if (currentUserQuery.data.role !== USER_ROLES.ADMIN) {
    return <ForbiddenPanel />;
  }
  return <AdminShell />;
}

function renderCurrentUserError(error: Error, onRetry: () => void): JSX.Element {
  if (error instanceof ApiError && error.isUnauthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <ErrorState message={getUserFacingErrorMessage(error)} onRetry={onRetry} />
    </div>
  );
}
