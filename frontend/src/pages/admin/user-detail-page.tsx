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
import { AdminBooksPanel } from '@/features/books/components/admin-books-panel';
import { AdminUserDetailSections } from '@/features/users/components/admin-user-detail-sections';
import { useAdminUser } from '@/features/users/hooks/use-admin-user';
import { useAdminUsersList } from '@/features/users/hooks/use-admin-users-list';
import { getAdminUserActionAvailability } from '@/features/users/lib/get-admin-user-action-availability';
import { parsePositiveInt } from '@/lib/parse-positive-int';
import { USER_ROLES } from '@/types/user-role';

/**
 * Admin user detail: profile, subscription, reading progress, role, and soft-delete.
 */
export function AdminUserDetailPage(): JSX.Element {
  const { userId: userIdParam } = useParams();
  const userId: number | null = parsePositiveInt(userIdParam);
  if (userId === null) {
    return (
      <>
        <PageHeader title="User" description="Profile, subscription, and reading progress." />
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
        <PageHeader title="User" description="Profile, subscription, and reading progress." />
        <PageSkeleton />
      </>
    );
  }
  if (userQuery.isError) {
    return (
      <>
        <PageHeader
          title="User"
          description="Profile, subscription, and reading progress."
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
  const detail = userQuery.data;
  const user = detail.user;
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
        breadcrumbs={[
          {
            label: user.role === 'admin' ? 'Admins' : 'Members',
            to: user.role === 'admin' ? '/admin/users/admins' : '/admin/users/members',
          },
        ]}
        description={
          user.isPublisher
            ? 'Profile, subscription, reading progress, and books this publisher owns.'
            : 'Profile, subscription, and reading progress.'
        }
        actions={backToUsersAction(user.role)}
      />
      <AdminUserDetailSections
        detail={detail}
        availability={availability}
        booksPanel={<AdminBooksPanel ownerId={user.id} />}
      />
    </>
  );
}

function backToUsersAction(role?: string): JSX.Element {
  const to: string = role === 'admin' ? '/admin/users/admins' : '/admin/users/members';
  return (
    <Button asChild variant="outline" size="sm">
      <Link to={to}>{role === 'admin' ? 'Back to admins' : 'Back to members'}</Link>
    </Button>
  );
}

function getUserLoadMessage(error: Error): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'This user was not found. The account may have been deleted.';
  }
  return getUserFacingErrorMessage(error);
}
