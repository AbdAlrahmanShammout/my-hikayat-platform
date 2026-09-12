import { useSyncExternalStore } from 'react';

import {
  offlineDownloadProgressStore,
  type OfflineDownloadProgress,
} from '@/features/offline/lib/offline-download-progress-store';

/**
 * Subscribes to the in-progress offline download shown on My Books.
 */
export function useOfflineDownloadProgress(): OfflineDownloadProgress | null {
  return useSyncExternalStore(
    offlineDownloadProgressStore.subscribe,
    offlineDownloadProgressStore.getSnapshot,
    offlineDownloadProgressStore.getSnapshot,
  );
}
