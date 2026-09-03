import {
  cancelPendingOfflineBookmarkCreate,
  clearOfflineBookmarksDocument,
  enqueueOfflineBookmarkOp,
  listOfflineBookmarkPendingOps,
  listOfflineBookmarksForBook,
  upsertOfflineBookmark,
} from '@/features/reader/lib/offline-bookmark-storage';

const mockGetInfoAsync = jest.fn();
const mockReadAsStringAsync = jest.fn();
const mockWriteAsStringAsync = jest.fn();
const mockMakeDirectoryAsync = jest.fn();

jest.mock('@/native/offline-file-system', () => ({
  offlineFileSystem: {
    documentDirectory: '/tmp/',
    EncodingType: { Base64: 'base64' },
    getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
    readAsStringAsync: (...args: unknown[]) => mockReadAsStringAsync(...args),
    writeAsStringAsync: (...args: unknown[]) => mockWriteAsStringAsync(...args),
    makeDirectoryAsync: (...args: unknown[]) => mockMakeDirectoryAsync(...args),
  },
}));

describe('offline-bookmark-storage', () => {
  let stored = '';

  beforeEach(() => {
    jest.clearAllMocks();
    stored = '';
    mockMakeDirectoryAsync.mockResolvedValue(undefined);
    mockGetInfoAsync.mockImplementation(async () => ({ exists: stored.length > 0 }));
    mockReadAsStringAsync.mockImplementation(async () => stored);
    mockWriteAsStringAsync.mockImplementation(async (_path: string, value: string) => {
      stored = value;
    });
  });

  it('stores bookmarks per user and book', async () => {
    await upsertOfflineBookmark({
      localId: 'local-1',
      userId: 4,
      bookId: 8,
      serverId: null,
      layoutType: 'reflowable',
      spineIndex: 1,
      scrollOffset: 20,
      spreadIndex: null,
      pageNumber: null,
      createdAt: '2026-09-03T12:00:00.000Z',
      updatedAt: '2026-09-03T12:00:00.000Z',
    });
    const actual = await listOfflineBookmarksForBook(4, 8);
    expect(actual).toHaveLength(1);
    expect(actual[0]?.localId).toBe('local-1');
    expect(await listOfflineBookmarksForBook(4, 9)).toHaveLength(0);
  });

  it('cancels pending create when an unsynced bookmark is removed', async () => {
    await enqueueOfflineBookmarkOp({
      opId: 'op-1',
      userId: 4,
      bookId: 8,
      type: 'create',
      localId: 'local-1',
      serverId: null,
      body: { spineIndex: 1, scrollOffset: 0 },
      createdAt: '2026-09-03T12:00:00.000Z',
      attemptCount: 0,
      lastAttemptAt: null,
      lastError: null,
    });
    await cancelPendingOfflineBookmarkCreate(4, 'local-1');
    expect(await listOfflineBookmarkPendingOps(4)).toHaveLength(0);
  });

  it('clears bookmarks and pending ops', async () => {
    await upsertOfflineBookmark({
      localId: 'local-1',
      userId: 4,
      bookId: 8,
      serverId: 11,
      layoutType: 'fixed_layout',
      spineIndex: null,
      scrollOffset: null,
      spreadIndex: 0,
      pageNumber: 1,
      createdAt: '2026-09-03T12:00:00.000Z',
      updatedAt: '2026-09-03T12:00:00.000Z',
    });
    await clearOfflineBookmarksDocument();
    expect(await listOfflineBookmarksForBook(4, 8)).toHaveLength(0);
  });
});
