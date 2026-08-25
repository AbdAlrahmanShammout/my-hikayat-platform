import { ApiError } from '@/api/api-error';
import { getReadingProgress } from '@/features/reader/api/get-reading-progress';

import { findReadingProgress } from './find-reading-progress';

jest.mock('@/features/reader/api/get-reading-progress', () => ({
  getReadingProgress: jest.fn(),
}));

const mockGetProgress = getReadingProgress as jest.MockedFunction<typeof getReadingProgress>;

describe('findReadingProgress', () => {
  beforeEach(() => {
    mockGetProgress.mockReset();
  });

  it('returns null when no progress exists yet', async () => {
    mockGetProgress.mockRejectedValue(
      new ApiError({
        message: 'missing',
        code: 'RESOURCE_NOT_FOUND',
        statusCode: 404,
      }),
    );
    await expect(findReadingProgress(8)).resolves.toBeNull();
  });

  it('returns saved progress when present', async () => {
    mockGetProgress.mockResolvedValue({
      id: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      userId: 2,
      bookId: 8,
      layoutType: 'reflowable',
      spineIndex: 1,
      scrollOffset: 40,
      spreadIndex: null,
      pageNumber: null,
      lastSessionAt: '2026-01-02T00:00:00.000Z',
    });
    const actual = await findReadingProgress(8);
    expect(actual?.spineIndex).toBe(1);
  });
});
