import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { updateAdminPlatformSettings } from '@/features/platform-settings/api/update-admin-platform-settings';
import type { components } from '@/generated/admin';

/**
 * PATCH /admin/platform-settings mutation.
 */
export function useUpdateAdminPlatformSettings(): UseMutationResult<
  components['schemas']['PlatformSettingsResponse'],
  Error,
  components['schemas']['UpdatePlatformSettingsRequestDto']
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminPlatformSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.platformSettings.all });
    },
  });
}
