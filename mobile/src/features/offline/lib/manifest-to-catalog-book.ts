import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';

/**
 * Maps a local offline manifest into a minimal catalog book projection for reader engines.
 */
export function manifestToCatalogBook(manifest: OfflineBookManifest): CatalogBook {
  return {
    id: manifest.bookId,
    title: manifest.title,
    description: manifest.description,
    layoutType: manifest.layoutType,
    bookType: 'standard_chapter',
    publishingStatus: 'approved',
    processingStatus: 'ready',
    ownerId: 0,
    categories: [],
    createdAt: manifest.downloadedAt,
    updatedAt: manifest.downloadedAt,
    cover: null,
  };
}
