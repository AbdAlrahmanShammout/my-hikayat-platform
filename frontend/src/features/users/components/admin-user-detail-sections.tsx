import type { JSX, ReactNode } from 'react';
import { useSearchParams } from 'react-router';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUserActions } from '@/features/users/components/admin-user-actions';
import { AdminUserDetailSummary } from '@/features/users/components/admin-user-detail-summary';
import { AdminUserEditForm } from '@/features/users/components/admin-user-edit-form';
import { AdminUserReadingProgressCard } from '@/features/users/components/admin-user-reading-progress-card';
import { AdminUserSubscriptionCard } from '@/features/users/components/admin-user-subscription-card';
import type { AdminUserActionAvailability } from '@/features/users/lib/get-admin-user-action-availability';
import {
  ADMIN_USER_DETAIL_SECTIONS,
  parseAdminUserDetailSection,
  type AdminUserDetailSection,
} from '@/features/users/lib/parse-admin-user-detail-section';
import type { components } from '@/generated/admin';

type AdminUserDetailSectionsProps = {
  readonly detail: components['schemas']['GetAdminUserDetailResponseDto'];
  readonly availability: AdminUserActionAvailability;
  readonly booksPanel: ReactNode;
};

/**
 * Profile fields, plus a Books tab when the user can own books.
 */
export function AdminUserDetailSections({
  detail,
  availability,
  booksPanel,
}: AdminUserDetailSectionsProps): JSX.Element {
  const user = detail.user;
  if (!user.isPublisher) {
    return <AdminUserProfileSection detail={detail} availability={availability} />;
  }
  return (
    <PublisherUserSections detail={detail} availability={availability} booksPanel={booksPanel} />
  );
}

function PublisherUserSections({
  detail,
  availability,
  booksPanel,
}: AdminUserDetailSectionsProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const section: AdminUserDetailSection = parseAdminUserDetailSection(searchParams.get('section'));
  const selectSection = (nextSection: AdminUserDetailSection): void => {
    const params: URLSearchParams = new URLSearchParams(searchParams);
    if (nextSection === ADMIN_USER_DETAIL_SECTIONS.PROFILE) {
      params.delete('section');
    } else {
      params.set('section', nextSection);
    }
    setSearchParams(params, { replace: true });
  };
  return (
    <Tabs
      value={section}
      defaultValue={ADMIN_USER_DETAIL_SECTIONS.PROFILE}
      onValueChange={(nextSection: string) => {
        selectSection(
          nextSection === ADMIN_USER_DETAIL_SECTIONS.BOOKS
            ? ADMIN_USER_DETAIL_SECTIONS.BOOKS
            : ADMIN_USER_DETAIL_SECTIONS.PROFILE,
        );
      }}
    >
      <TabsList aria-label="User profile sections">
        <TabsTrigger value={ADMIN_USER_DETAIL_SECTIONS.PROFILE}>Profile</TabsTrigger>
        <TabsTrigger value={ADMIN_USER_DETAIL_SECTIONS.BOOKS}>Books</TabsTrigger>
      </TabsList>
      <TabsContent value={ADMIN_USER_DETAIL_SECTIONS.PROFILE}>
        <AdminUserProfileSection detail={detail} availability={availability} />
      </TabsContent>
      <TabsContent value={ADMIN_USER_DETAIL_SECTIONS.BOOKS}>
        {booksPanel}
      </TabsContent>
    </Tabs>
  );
}

function AdminUserProfileSection({
  detail,
  availability,
}: {
  readonly detail: components['schemas']['GetAdminUserDetailResponseDto'];
  readonly availability: AdminUserActionAvailability;
}): JSX.Element {
  const user = detail.user;
  return (
    <div className="space-y-6">
      <AdminUserActions user={user} availability={availability} />
      <AdminUserDetailSummary user={user} />
      <AdminUserSubscriptionCard
        subscription={detail.subscription ?? null}
        subscriptionPeriod={detail.subscriptionPeriod}
      />
      <AdminUserReadingProgressCard items={detail.readingProgress} />
      <AdminUserEditForm key={`${user.id}-${user.updatedAt}`} user={user} availability={availability} />
    </div>
  );
}
