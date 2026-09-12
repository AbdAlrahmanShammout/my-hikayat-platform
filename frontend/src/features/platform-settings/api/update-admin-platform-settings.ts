import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Updates admin-configured platform settings. Empty URL/mission fields clear those values.
 */
export async function updateAdminPlatformSettings(
  body: components['schemas']['UpdatePlatformSettingsRequestDto'],
): Promise<components['schemas']['PlatformSettingsResponse']> {
  return requestJson<components['schemas']['PlatformSettingsResponse']>({
    path: '/admin/platform-settings',
    method: 'PATCH',
    body,
  });
}
