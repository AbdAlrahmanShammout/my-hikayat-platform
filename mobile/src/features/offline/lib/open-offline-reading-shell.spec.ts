import { openOfflineReadingShell } from '@/features/offline/lib/open-offline-reading-shell';

const mockGetOfflineManifest = jest.fn();
const mockGetOfflineReadingProgress = jest.fn();
const mockReadCurrentUserId = jest.fn();

jest.mock('@/features/offline/lib/offline-manifest-storage', () => ({
  getOfflineManifest: (...args: unknown[]) => mockGetOfflineManifest(...args),
}));

jest.mock('@/features/offline/lib/offline-progress-storage', () => ({
  getOfflineReadingProgress: (...args: unknown[]) => mockGetOfflineReadingProgress(...args),
}));

jest.mock('@/session/read-current-user-id', () => ({
  readCurrentUserId: () => mockReadCurrentUserId(),
}));

describe('openOfflineReadingShell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('seeds the offline session from local progress', async () => {
    mockGetOfflineManifest.mockResolvedValue({
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
      offlineLease: null,
    });
    mockReadCurrentUserId.mockReturnValue(4);
    mockGetOfflineReadingProgress.mockResolvedValue({
      userId: 4,
      bookId: 5,
      layoutType: 'reflowable',
      spineIndex: 2,
      scrollOffset: 55,
      spreadIndex: null,
      pageNumber: null,
      updatedAt: '2026-09-03T12:00:00.000Z',
    });
    const actual = await openOfflineReadingShell(5);
    expect(actual.isOfflinePackage).toBe(true);
    expect(actual.session.spineIndex).toBe(2);
    expect(actual.session.scrollOffset).toBe(55);
    expect(mockGetOfflineReadingProgress).toHaveBeenCalledWith(4, 5);
  });

  it('falls back to chapter one when no local progress exists', async () => {
    mockGetOfflineManifest.mockResolvedValue({
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
      offlineLease: null,
    });
    mockReadCurrentUserId.mockReturnValue(4);
    mockGetOfflineReadingProgress.mockResolvedValue(null);
    const actual = await openOfflineReadingShell(5);
    expect(actual.session.spineIndex).toBe(0);
    expect(actual.session.scrollOffset).toBe(0);
  });
});
