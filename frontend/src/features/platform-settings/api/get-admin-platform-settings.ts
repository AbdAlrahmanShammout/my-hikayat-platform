import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Loads admin-configured platform settings including the Privacy Policy URL.
 */
export async function getAdminPlatformSettings(): Promise<
  components['schemas']['PlatformSettingsResponse']
> {
  return requestJson<components['schemas']['PlatformSettingsResponse']>({
    path: '/admin/platform-settings',
    method: 'GET',
  });
}
