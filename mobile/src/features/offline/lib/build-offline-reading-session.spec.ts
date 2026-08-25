import { buildOfflineReadingSession, OFFLINE_READING_SESSION_ID } from '@/features/offline/lib/build-offline-reading-session';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';

describe('buildOfflineReadingSession', () => {
  it('builds a reflowable offline session stub', () => {
    const manifest: OfflineBookManifest = {
      bookId: 5,
      bookAssetId: 9,
      title: 'Moon Story',
      description: 'A tale',
      layoutType: 'reflowable',
      checksumSha256: 'abc',
      contentType: 'application/epub+zip',
      byteSize: 100,
      ciphertextFileName: '5-9.enc',
      downloadedAt: '2026-08-25T00:00:00.000Z',
    };
    const actual = buildOfflineReadingSession(manifest);
    expect(actual.id).toBe(OFFLINE_READING_SESSION_ID);
    expect(actual.spineIndex).toBe(0);
    expect(actual.scrollOffset).toBe(0);
  });

  it('builds a fixed-layout offline session stub', () => {
    const manifest: OfflineBookManifest = {
      bookId: 6,
      bookAssetId: 10,
      title: 'Canvas Book',
      description: '',
      layoutType: 'fixed_layout',
      checksumSha256: null,
      contentType: null,
      byteSize: null,
      ciphertextFileName: '6-10.enc',
      downloadedAt: '2026-08-25T00:00:00.000Z',
    };
    const actual = buildOfflineReadingSession(manifest);
    expect(actual.spreadIndex).toBe(0);
    expect(actual.pageNumber).toBe(1);
  });
});
