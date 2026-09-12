import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type ReaderPlatformSettings = components['schemas']['PlatformSettingsResponse'];

/**
 * Loads reader-visible platform settings, including the optional Privacy Policy URL.
 */
export async function getReaderPlatformSettings(): Promise<ReaderPlatformSettings> {
  return requestJson<ReaderPlatformSettings>({
    path: '/reader/platform-settings',
    method: 'GET',
  });
}
