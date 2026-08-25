import { listReadingBookmarkItems } from '@/features/reader/api/list-reading-bookmarks';
import { requestJson } from '@/api/client';

jest.mock('@/api/client', () => ({
  requestJson: jest.fn(),
}));

const mockRequestJson = requestJson as jest.MockedFunction<typeof requestJson>;

describe('listReadingBookmarkItems', () => {
  beforeEach(() => {
    mockRequestJson.mockReset();
  });

  it('returns bookmark entities from the list response', async () => {
    mockRequestJson.mockResolvedValue({
      bookmarks: [
        {
          id: 5,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          userId: 2,
          bookId: 8,
          layoutType: 'reflowable',
          spineIndex: 1,
          scrollOffset: 20,
          spreadIndex: null,
          pageNumber: null,
        },
      ],
      total: 1,
    });
    const actual = await listReadingBookmarkItems(8);
    expect(actual).toHaveLength(1);
    expect(actual[0]?.id).toBe(5);
    expect(mockRequestJson).toHaveBeenCalledWith({
      path: '/reader/books/8/bookmarks',
      method: 'GET',
    });
  });
});
