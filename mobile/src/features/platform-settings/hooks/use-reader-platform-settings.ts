import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getReaderPlatformSettings } from '@/features/platform-settings/api/get-reader-platform-settings';

/**
 * Loads authenticated reader platform settings for Me and Settings legal rows.
 */
export function useReaderPlatformSettings() {
  return useQuery({
    queryKey: queryKeys.platformSettings.detail(),
    queryFn: getReaderPlatformSettings,
    staleTime: 60_000,
  });
}
