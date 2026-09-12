import { resolveCatalogCoverPresentation } from '@/features/catalog/lib/resolve-catalog-cover-presentation';
import { buildOfflineCoverFileName } from '@/features/offline/lib/build-offline-cover-file-name';
import {
  deleteOfflineFileIfExists,
  downloadOfflineCiphertextFile,
  resolveOfflineCoverPath,
} from '@/storage/offline-file-storage';

export type CacheOfflineBookCoverInput = {
  readonly bookId: number;
  readonly cover: { readonly url: string } | null | undefined;
};

export type CacheOfflineBookCoverResult = {
  readonly coverFileName: string | null;
};

/**
 * Best-effort cover snapshot for offline My Books. Failures leave coverFileName null.
 */
export async function cacheOfflineBookCover(
  input: CacheOfflineBookCoverInput,
): Promise<CacheOfflineBookCoverResult> {
  const cover = resolveCatalogCoverPresentation(input.cover);
  if (cover.kind !== 'image') {
    return { coverFileName: null };
  }
  const coverFileName: string = buildOfflineCoverFileName(input.bookId);
  const targetPath: string = resolveOfflineCoverPath(coverFileName);
  try {
    await deleteOfflineFileIfExists(targetPath);
    await downloadOfflineCiphertextFile({
      url: cover.url,
      targetPath,
    });
    return { coverFileName };
  } catch {
    await deleteOfflineFileIfExists(targetPath).catch(() => undefined);
    return { coverFileName: null };
  }
}
