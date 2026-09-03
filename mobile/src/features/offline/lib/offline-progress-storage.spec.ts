import {
  clearOfflineProgressDocument,
  getOfflineReadingProgress,
  upsertOfflineReadingProgress,
} from '@/features/offline/lib/offline-progress-storage';

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

describe('offline-progress-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMakeDirectoryAsync.mockResolvedValue(undefined);
    mockWriteAsStringAsync.mockResolvedValue(undefined);
    mockGetInfoAsync.mockResolvedValue({ exists: false });
  });

  it('upserts and loads progress by user and book', async () => {
    let stored = '';
    mockGetInfoAsync.mockImplementation(async () => ({ exists: stored.length > 0 }));
    mockReadAsStringAsync.mockImplementation(async () => stored);
    mockWriteAsStringAsync.mockImplementation(async (_path: string, value: string) => {
      stored = value;
    });
    await upsertOfflineReadingProgress({
      userId: 4,
      bookId: 8,
      layoutType: 'reflowable',
      spineIndex: 2,
      scrollOffset: 120,
      spreadIndex: null,
      pageNumber: null,
      updatedAt: '2026-09-03T12:00:00.000Z',
    });
    const actual = await getOfflineReadingProgress(4, 8);
    expect(actual).toEqual({
      userId: 4,
      bookId: 8,
      layoutType: 'reflowable',
      spineIndex: 2,
      scrollOffset: 120,
      spreadIndex: null,
      pageNumber: null,
      updatedAt: '2026-09-03T12:00:00.000Z',
    });
    expect(await getOfflineReadingProgress(4, 9)).toBeNull();
    expect(await getOfflineReadingProgress(5, 8)).toBeNull();
  });

  it('overwrites the same user and book key', async () => {
    let stored = '';
    mockGetInfoAsync.mockImplementation(async () => ({ exists: stored.length > 0 }));
    mockReadAsStringAsync.mockImplementation(async () => stored);
    mockWriteAsStringAsync.mockImplementation(async (_path: string, value: string) => {
      stored = value;
    });
    await upsertOfflineReadingProgress({
      userId: 4,
      bookId: 8,
      layoutType: 'fixed_layout',
      spineIndex: null,
      scrollOffset: null,
      spreadIndex: 0,
      pageNumber: 1,
      updatedAt: '2026-09-03T12:00:00.000Z',
    });
    await upsertOfflineReadingProgress({
      userId: 4,
      bookId: 8,
      layoutType: 'fixed_layout',
      spineIndex: null,
      scrollOffset: null,
      spreadIndex: 3,
      pageNumber: 4,
      updatedAt: '2026-09-03T13:00:00.000Z',
    });
    const actual = await getOfflineReadingProgress(4, 8);
    expect(actual?.spreadIndex).toBe(3);
    expect(actual?.pageNumber).toBe(4);
  });

  it('clears all progress records', async () => {
    let stored = JSON.stringify({
      schemaVersion: 1,
      records: [
        {
          userId: 4,
          bookId: 8,
          layoutType: 'reflowable',
          spineIndex: 1,
          scrollOffset: 0,
          spreadIndex: null,
          pageNumber: null,
          updatedAt: '2026-09-03T12:00:00.000Z',
        },
      ],
    });
    mockGetInfoAsync.mockImplementation(async () => ({ exists: stored.length > 0 }));
    mockReadAsStringAsync.mockImplementation(async () => stored);
    mockWriteAsStringAsync.mockImplementation(async (_path: string, value: string) => {
      stored = value;
    });
    await clearOfflineProgressDocument();
    expect(await getOfflineReadingProgress(4, 8)).toBeNull();
  });

  it('returns empty document for corrupt progress files', async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: true });
    mockReadAsStringAsync.mockResolvedValue('{not-json');
    expect(await getOfflineReadingProgress(4, 8)).toBeNull();
  });
});
