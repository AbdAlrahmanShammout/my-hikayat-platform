import { flushOfflineProgressOpsBestEffort } from '@/features/offline/lib/flush-offline-progress-ops';

const mockFetchConnectivitySnapshot = jest.fn();
const mockReadCurrentUserId = jest.fn();
const mockListPending = jest.fn();
const mockMarkSynced = jest.fn();
const mockUpsert = jest.fn();
const mockGetReadingProgress = jest.fn();
const mockSaveReadingProgress = jest.fn();

jest.mock('@/native/connectivity/net-info-adapter', () => ({
  fetchConnectivitySnapshot: () => mockFetchConnectivitySnapshot(),
}));

jest.mock('@/session/read-current-user-id', () => ({
  readCurrentUserId: () => mockReadCurrentUserId(),
}));

jest.mock('@/features/offline/lib/offline-progress-storage', () => ({
  listPendingOfflineReadingProgress: (...args: unknown[]) => mockListPending(...args),
  markOfflineReadingProgressSynced: (...args: unknown[]) => mockMarkSynced(...args),
  upsertOfflineReadingProgress: (...args: unknown[]) => mockUpsert(...args),
}));

jest.mock('@/features/reader/api/get-reading-progress', () => ({
  getReadingProgress: (...args: unknown[]) => mockGetReadingProgress(...args),
}));

jest.mock('@/features/reader/api/save-reading-progress', () => ({
  saveReadingProgress: (...args: unknown[]) => mockSaveReadingProgress(...args),
}));

describe('flushOfflineProgressOpsBestEffort', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchConnectivitySnapshot.mockResolvedValue({ isOnline: true });
    mockReadCurrentUserId.mockReturnValue(4);
    mockMarkSynced.mockResolvedValue(undefined);
    mockUpsert.mockResolvedValue(undefined);
  });

  it('uploads newer local progress and clears pendingSync', async () => {
    mockListPending.mockResolvedValue([
      {
        userId: 4,
        bookId: 8,
        layoutType: 'reflowable',
        spineIndex: 2,
        scrollOffset: 40,
        spreadIndex: null,
        pageNumber: null,
        updatedAt: '2026-09-03T14:00:00.000Z',
        pendingSync: true,
      },
    ]);
    mockGetReadingProgress.mockResolvedValue({
      id: 1,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-03T12:00:00.000Z',
      userId: 4,
      bookId: 8,
      layoutType: 'reflowable',
      spineIndex: 1,
      scrollOffset: 0,
      lastSessionAt: '2026-09-03T12:00:00.000Z',
    });
    mockSaveReadingProgress.mockResolvedValue({});
    await flushOfflineProgressOpsBestEffort();
    expect(mockSaveReadingProgress).toHaveBeenCalledWith({
      bookId: 8,
      body: { spineIndex: 2, scrollOffset: 40 },
    });
    expect(mockMarkSynced).toHaveBeenCalledWith(4, 8);
  });

  it('keeps newer server progress and does not overwrite it', async () => {
    mockListPending.mockResolvedValue([
      {
        userId: 4,
        bookId: 8,
        layoutType: 'reflowable',
        spineIndex: 1,
        scrollOffset: 0,
        spreadIndex: null,
        pageNumber: null,
        updatedAt: '2026-09-03T10:00:00.000Z',
        pendingSync: true,
      },
    ]);
    mockGetReadingProgress.mockResolvedValue({
      id: 1,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-03T15:00:00.000Z',
      userId: 4,
      bookId: 8,
      layoutType: 'reflowable',
      spineIndex: 4,
      scrollOffset: 10,
      lastSessionAt: '2026-09-03T15:00:00.000Z',
    });
    await flushOfflineProgressOpsBestEffort();
    expect(mockSaveReadingProgress).not.toHaveBeenCalled();
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        bookId: 8,
        spineIndex: 4,
        pendingSync: false,
      }),
    );
    expect(mockMarkSynced).toHaveBeenCalledWith(4, 8);
  });
});
