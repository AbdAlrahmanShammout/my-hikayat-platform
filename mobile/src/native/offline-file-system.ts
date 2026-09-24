import type * as ExpoFileSystemLegacy from 'expo-file-system/build/legacy';
import { Platform } from 'react-native';

type OfflineFileSystemModule = typeof ExpoFileSystemLegacy;

const WEB_DOCUMENT_DIRECTORY = 'web-offline://';
const WEB_OFFLINE_UNAVAILABLE = 'Offline file storage is not available on web.';

/**
 * Legacy expo-file-system entry used for encrypted offline ciphertext I/O.
 * Runtime require avoids TypeScript pulling unpublished package sources into tsc.
 * Web has no native directories; directory and file I/O no-ops so sign-out can purge safely.
 */
export const offlineFileSystem: OfflineFileSystemModule = resolveOfflineFileSystem();

function resolveOfflineFileSystem(): OfflineFileSystemModule {
  const nativeOfflineFileSystem: OfflineFileSystemModule =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('expo-file-system/legacy') as OfflineFileSystemModule;
  if (Platform.OS === 'web') {
    return createWebOfflineFileSystem(nativeOfflineFileSystem);
  }
  return nativeOfflineFileSystem;
}

function createWebOfflineFileSystem(native: OfflineFileSystemModule): OfflineFileSystemModule {
  return {
    ...native,
    documentDirectory: WEB_DOCUMENT_DIRECTORY,
    makeDirectoryAsync: async (): Promise<void> => {
      return;
    },
    getInfoAsync: async (fileUri: string) => {
      return {
        exists: false as const,
        uri: fileUri,
        isDirectory: false as const,
      };
    },
    deleteAsync: async (): Promise<void> => {
      return;
    },
    readAsStringAsync: async (): Promise<string> => {
      return '';
    },
    writeAsStringAsync: async (): Promise<void> => {
      return;
    },
    downloadAsync: async () => {
      throw new Error(WEB_OFFLINE_UNAVAILABLE);
    },
    createDownloadResumable: () => {
      throw new Error(WEB_OFFLINE_UNAVAILABLE);
    },
  };
}
