import { resolveOfflineCoverPath } from '@/storage/offline-file-storage';

/**
 * Returns a file URI for a cached offline cover, or null when none was stored.
 */
export function resolveOfflineCoverUri(coverFileName: string | null | undefined): string | null {
  if (coverFileName === null || coverFileName === undefined) {
    return null;
  }
  const trimmed: string = coverFileName.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return resolveOfflineCoverPath(trimmed);
}
