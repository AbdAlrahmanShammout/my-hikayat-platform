import { manifestToCatalogBook } from '@/features/offline/lib/manifest-to-catalog-book';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';

describe('manifestToCatalogBook', () => {
  it('maps manifest fields into a catalog book projection', () => {
    const manifest: OfflineBookManifest = {
      bookId: 2,
      bookAssetId: 4,
      title: 'River Tale',
      description: 'About a river',
      layoutType: 'reflowable',
      checksumSha256: 'deadbeef',
      contentType: 'application/epub+zip',
      byteSize: 2048,
      ciphertextFileName: '2-4.enc',
      downloadedAt: '2026-08-25T12:00:00.000Z',
      offlineLease: null,
    };
    const actual = manifestToCatalogBook(manifest);
    expect(actual.id).toBe(2);
    expect(actual.title).toBe('River Tale');
    expect(actual.layoutType).toBe('reflowable');
    expect(actual.cover).toBeNull();
  });
});
