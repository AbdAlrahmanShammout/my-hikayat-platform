import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type OfflineDownloadSlot = components['schemas']['OfflineDownloadResponse'];

/**
 * Reserves one of three server-side offline download slots for this book.
 */
export async function registerOfflineDownload(bookId: number): Promise<OfflineDownloadSlot> {
  return requestJson<OfflineDownloadSlot>({
    path: `/reader/books/${bookId}/offline-download`,
    method: 'POST',
  });
}

/**
 * Releases the server-side offline download slot when the local package is removed.
 */
export async function releaseOfflineDownload(bookId: number): Promise<void> {
  await requestJson<void>({
    path: `/reader/books/${bookId}/offline-download`,
    method: 'DELETE',
  });
}
