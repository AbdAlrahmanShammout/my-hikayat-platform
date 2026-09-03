import { saveOfflineReadingProgressBestEffort } from '@/features/offline/lib/save-offline-reading-progress-best-effort';

const mockReadCurrentUserId = jest.fn();
const mockUpsertOfflineReadingProgress = jest.fn();

jest.mock('@/session/read-current-user-id', () => ({
  readCurrentUserId: () => mockReadCurrentUserId(),
}));

jest.mock('@/features/offline/lib/offline-progress-storage', () => ({
  upsertOfflineReadingProgress: (...args: unknown[]) =>
    mockUpsertOfflineReadingProgress(...args),
}));

describe('saveOfflineReadingProgressBestEffort', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists reflowable progress for the signed-in user', async () => {
    mockReadCurrentUserId.mockReturnValue(4);
    mockUpsertOfflineReadingProgress.mockResolvedValue(undefined);
    await saveOfflineReadingProgressBestEffort({
      bookId: 8,
      position: {
        layoutType: 'reflowable',
        spineIndex: 2,
        scrollOffset: 90,
      },
    });
    expect(mockUpsertOfflineReadingProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 4,
        bookId: 8,
        layoutType: 'reflowable',
        spineIndex: 2,
        scrollOffset: 90,
      }),
    );
  });

  it('skips persistence when no user id is available', async () => {
    mockReadCurrentUserId.mockReturnValue(null);
    await saveOfflineReadingProgressBestEffort({
      bookId: 8,
      position: {
        layoutType: 'fixed_layout',
        spreadIndex: 1,
        pageNumber: 2,
      },
    });
    expect(mockUpsertOfflineReadingProgress).not.toHaveBeenCalled();
  });

  it('swallows storage failures', async () => {
    mockReadCurrentUserId.mockReturnValue(4);
    mockUpsertOfflineReadingProgress.mockRejectedValue(new Error('disk full'));
    await expect(
      saveOfflineReadingProgressBestEffort({
        bookId: 8,
        position: {
          layoutType: 'fixed_layout',
          spreadIndex: 1,
          pageNumber: 2,
        },
      }),
    ).resolves.toBeUndefined();
  });
});
