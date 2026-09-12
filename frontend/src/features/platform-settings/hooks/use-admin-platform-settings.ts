import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getAdminPlatformSettings } from '@/features/platform-settings/api/get-admin-platform-settings';
import type { components } from '@/generated/admin';

/**
 * Server-state hook for GET /admin/platform-settings.
 */
export function useAdminPlatformSettings(): UseQueryResult<
  components['schemas']['PlatformSettingsResponse'],
  Error
> {
  return useQuery({
    queryKey: queryKeys.admin.platformSettings.detail(),
    queryFn: getAdminPlatformSettings,
  });
}
