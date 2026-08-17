import type { JSX } from 'react';
import { Link, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button } from '@/components/ui/button';
import { ADMIN_COUNT_LIST_LIMIT } from '@/config/admin-count-list-limit';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { AdminUserActions } from '@/features/users/components/admin-user-actions';
import { AdminUserDetailSummary } from '@/features/users/components/admin-user-detail-summary';
import { AdminUserEditForm } from '@/features/users/components/admin-user-edit-form';
import { useAdminUser } from '@/features/users/hooks/use-admin-user';
import { useAdminUsersList } from '@/features/users/hooks/use-admin-users-list';
import { getAdminUserActionAvailability } from '@/features/users/lib/get-admin-user-action-availability';
import { parsePositiveInt } from '@/lib/parse-positive-int';
import { USER_ROLES } from '@/types/user-role';

/**
 * Admin user detail: role, publisher capability, and soft-delete.
 */
export function AdminUserDetailPage(): JSX.Element {
  const { userId: userIdParam } = useParams();
  const userId: number | null = parsePositiveInt(userIdParam);
  if (userId === null) {
    return (
      <>
        <PageHeader title="User" description="Change role and publisher capability." />
        <ErrorState
          title="Invalid user id"
          message="The user id in the URL must be a positive integer."
        />
      </>
    );
  }
  return <AdminUserDetailContent userId={userId} />;
}

function AdminUserDetailContent({ userId }: { readonly userId: number }): JSX.Element {
  const userQuery = useAdminUser(userId);
  const currentUserQuery = useCurrentUser();
  const adminCountQuery = useAdminUsersList({
    role: USER_ROLES.ADMIN,
    limit: ADMIN_COUNT_LIST_LIMIT,
  });
  if (userQuery.isPending) {
    return (
      <>
        <PageHeader title="User" description="Change role and publisher capability." />
        <PageSkeleton />
      </>
    );
  }
  if (userQuery.isError) {
    return (
      <>
        <PageHeader
          title="User"
          description="Change role and publisher capability."
          actions={backToUsersAction()}
        />
        <ErrorState
          message={getUserLoadMessage(userQuery.error)}
          onRetry={() => {
            void userQuery.refetch();
          }}
        />
      </>
    );
  }
  const user = userQuery.data;
  const availability = getAdminUserActionAvailability({
    targetUserId: user.id,
    targetRole: user.role,
    actorUserId: currentUserQuery.data?.id,
    adminTotal: adminCountQuery.data?.total,
  });
  return (
    <>
      <PageHeader
        title={user.email}
        description="Change role and publisher capability."
        actions={backToUsersAction()}
      />
      <div className="space-y-6">
        <AdminUserActions user={user} availability={availability} />
        <AdminUserDetailSummary user={user} />
        <AdminUserEditForm
          key={`${user.id}-${user.updatedAt}`}
          user={user}
          availability={availability}
        />
      </div>
    </>
  );
}

function backToUsersAction(): JSX.Element {
  return (
    <Button asChild variant="outline">
      <Link to="/admin/users">Back to users</Link>
    </Button>
  );
}

function getUserLoadMessage(error: Error): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'This user was not found. The account may have been deleted.';
  }
  return getUserFacingErrorMessage(error);
}
