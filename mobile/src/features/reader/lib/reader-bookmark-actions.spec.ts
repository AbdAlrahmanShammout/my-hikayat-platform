import {
  addReaderBookmark,
  removeReaderBookmark,
} from '@/features/reader/lib/reader-bookmark-actions';

const mockReadCurrentUserId = jest.fn();
const mockFetchConnectivitySnapshot = jest.fn();
const mockUpsertOfflineBookmark = jest.fn();
const mockEnqueueOfflineBookmarkOp = jest.fn();
const mockRemoveOfflineBookmark = jest.fn();
const mockCancelPendingOfflineBookmarkCreate = jest.fn();
const mockCreateReadingBookmark = jest.fn();
const mockFlush = jest.fn();

jest.mock('@/session/read-current-user-id', () => ({
  readCurrentUserId: () => mockReadCurrentUserId(),
}));

jest.mock('@/native/connectivity/net-info-adapter', () => ({
  fetchConnectivitySnapshot: () => mockFetchConnectivitySnapshot(),
}));

jest.mock('@/features/reader/lib/offline-bookmark-storage', () => ({
  upsertOfflineBookmark: (...args: unknown[]) => mockUpsertOfflineBookmark(...args),
  enqueueOfflineBookmarkOp: (...args: unknown[]) => mockEnqueueOfflineBookmarkOp(...args),
  removeOfflineBookmark: (...args: unknown[]) => mockRemoveOfflineBookmark(...args),
  cancelPendingOfflineBookmarkCreate: (...args: unknown[]) =>
    mockCancelPendingOfflineBookmarkCreate(...args),
  listOfflineBookmarksForBook: jest.fn(async () => []),
  reconcileOfflineBookmarksWithServer: jest.fn(async () => undefined),
}));

jest.mock('@/features/reader/api/create-reading-bookmark', () => ({
  createReadingBookmark: (...args: unknown[]) => mockCreateReadingBookmark(...args),
}));

jest.mock('@/features/reader/api/delete-reading-bookmark', () => ({
  deleteReadingBookmark: jest.fn(),
}));

jest.mock('@/features/reader/api/list-reading-bookmarks', () => ({
  listReadingBookmarkItems: jest.fn(async () => []),
}));

jest.mock('@/features/reader/lib/flush-offline-bookmark-ops', () => ({
  flushOfflineBookmarkOpsBestEffort: (...args: unknown[]) => mockFlush(...args),
}));

describe('reader-bookmark-actions offline path', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadCurrentUserId.mockReturnValue(4);
    mockFetchConnectivitySnapshot.mockResolvedValue({ isOnline: false });
    mockUpsertOfflineBookmark.mockResolvedValue(undefined);
    mockEnqueueOfflineBookmarkOp.mockResolvedValue(undefined);
    mockRemoveOfflineBookmark.mockResolvedValue(undefined);
    mockCancelPendingOfflineBookmarkCreate.mockResolvedValue(undefined);
  });

  it('queues a local create when offline', async () => {
    await addReaderBookmark({
      bookId: 8,
      layoutType: 'reflowable',
      position: { kind: 'reflowable', spineIndex: 2, scrollOffset: 40 },
    });
    expect(mockCreateReadingBookmark).not.toHaveBeenCalled();
    expect(mockUpsertOfflineBookmark).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 4,
        bookId: 8,
        serverId: null,
        spineIndex: 2,
        scrollOffset: 40,
      }),
    );
    expect(mockEnqueueOfflineBookmarkOp).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'create',
        bookId: 8,
        body: { spineIndex: 2, scrollOffset: 40 },
      }),
    );
  });

  it('cancels pending create when deleting an unsynced bookmark', async () => {
    await removeReaderBookmark({
      bookId: 8,
      localId: 'local-1',
      serverId: null,
    });
    expect(mockRemoveOfflineBookmark).toHaveBeenCalledWith(4, 'local-1');
    expect(mockCancelPendingOfflineBookmarkCreate).toHaveBeenCalledWith(4, 'local-1');
  });
});
