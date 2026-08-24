import { startReadingSession } from './start-reading-session';
import { requestJson } from '@/api/client';

jest.mock('@/api/client', () => ({
  requestJson: jest.fn(),
}));

const mockRequestJson = requestJson as jest.MockedFunction<typeof requestJson>;

describe('startReadingSession', () => {
  beforeEach(() => {
    mockRequestJson.mockReset();
  });

  it('posts the sessions path with the position body', async () => {
    mockRequestJson.mockResolvedValue({
      id: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      userId: 2,
      bookId: 8,
      layoutType: 'reflowable',
      startedAt: '2026-01-01T00:00:00.000Z',
      endedAt: null,
      activeDurationMs: 0,
      idleDurationMs: 0,
      spineIndex: 0,
      scrollOffset: 0,
    });
    await startReadingSession({
      bookId: 8,
      body: { spineIndex: 0, scrollOffset: 0 },
    });
    expect(mockRequestJson).toHaveBeenCalledWith({
      path: '/reader/books/8/sessions',
      method: 'POST',
      body: { spineIndex: 0, scrollOffset: 0 },
    });
  });
});
