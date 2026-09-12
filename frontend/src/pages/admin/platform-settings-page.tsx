import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminPlatformSettingsPanel } from '@/features/platform-settings/components/admin-platform-settings-panel';

/**
 * Admin platform settings used by the reader app.
 */
export function AdminPlatformSettingsPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Privacy, Terms, About mission, and Sign in cover media for the reader app."
      />
      <AdminPlatformSettingsPanel />
    </>
  );
}
