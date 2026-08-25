import type * as ExpoFileSystemLegacy from 'expo-file-system/build/legacy';

type OfflineFileSystemModule = typeof ExpoFileSystemLegacy;

/**
 * Legacy expo-file-system entry used for encrypted offline ciphertext I/O.
 * Runtime require avoids TypeScript pulling unpublished package sources into tsc.
 */
export const offlineFileSystem: OfflineFileSystemModule =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('expo-file-system/legacy') as OfflineFileSystemModule;
