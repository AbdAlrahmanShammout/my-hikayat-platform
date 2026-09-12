import type { JSX } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';
import { PageSkeleton } from '@/components/page-skeleton';
import { AdminPlatformSettingsForm } from '@/features/platform-settings/components/admin-platform-settings-form';
import { useAdminPlatformSettings } from '@/features/platform-settings/hooks/use-admin-platform-settings';

/**
 * Admin platform settings for reader legal URLs, About copy, and Sign in chrome.
 */
export function AdminPlatformSettingsPanel(): JSX.Element {
  const settingsQuery = useAdminPlatformSettings();
  if (settingsQuery.isPending) {
    return <PageSkeleton />;
  }
  if (settingsQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(settingsQuery.error)}
        onRetry={() => {
          void settingsQuery.refetch();
        }}
      />
    );
  }
  return (
    <AdminPlatformSettingsForm
      key={`${settingsQuery.data.privacyPolicyUrl ?? ''}-${settingsQuery.data.termsOfServiceUrl ?? ''}-${settingsQuery.data.aboutMission ?? ''}-${settingsQuery.data.authCoverMediaUrl ?? ''}`}
      settings={settingsQuery.data}
    />
  );
}
