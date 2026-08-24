import { ApiError } from '@/api/api-error';
import { getCatalogBook } from '@/features/catalog/api/get-catalog-book';
import { createBookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import { getCurrentReadingSession } from '@/features/reader/api/get-current-reading-session';
import { startReadingSession } from '@/features/reader/api/start-reading-session';

import { openReadingShell } from './open-reading-shell';

jest.mock('@/features/catalog/api/get-catalog-book', () => ({
  getCatalogBook: jest.fn(),
}));
jest.mock('@/features/reader/api/create-delivery-grant', () => ({
  createBookAssetDeliveryGrant: jest.fn(),
}));
jest.mock('@/features/reader/api/get-current-reading-session', () => ({
  getCurrentReadingSession: jest.fn(),
}));
jest.mock('@/features/reader/api/start-reading-session', () => ({
  startReadingSession: jest.fn(),
}));

const mockGetCatalogBook = getCatalogBook as jest.MockedFunction<typeof getCatalogBook>;
const mockCreateGrant = createBookAssetDeliveryGrant as jest.MockedFunction<
  typeof createBookAssetDeliveryGrant
>;
const mockStartSession = startReadingSession as jest.MockedFunction<typeof startReadingSession>;
const mockGetCurrentSession = getCurrentReadingSession as jest.MockedFunction<
  typeof getCurrentReadingSession
>;

describe('openReadingShell', () => {
  beforeEach(() => {
    mockGetCatalogBook.mockReset();
    mockCreateGrant.mockReset();
    mockStartSession.mockReset();
    mockGetCurrentSession.mockReset();
  });

  it('opens a reflowable shell and tolerates missing source assets', async () => {
    mockGetCatalogBook.mockResolvedValue({
      id: 8,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      title: 'Harbor',
      description: 'Story',
      layoutType: 'reflowable',
      bookType: 'standard_chapter',
      publishingStatus: 'approved',
      processingStatus: 'ready',
      publishedAt: '2026-01-01T00:00:00.000Z',
      ownerId: 1,
      categories: [],
    });
    mockStartSession.mockResolvedValue({
      id: 44,
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
    mockCreateGrant.mockRejectedValue(
      new ApiError({
        message: 'missing',
        code: 'BOOK_ASSET_ENCRYPTED_SOURCE_MISSING',
        statusCode: 409,
      }),
    );
    const actual = await openReadingShell(8);
    expect(actual.engine).toBe('reflowable');
    expect(actual.session.id).toBe(44);
    expect(actual.deliveryGrant).toBeNull();
    expect(mockStartSession).toHaveBeenCalledWith({
      bookId: 8,
      body: { spineIndex: 0, scrollOffset: 0 },
    });
  });

  it('resumes an already-open session', async () => {
    mockGetCatalogBook.mockResolvedValue({
      id: 9,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      title: 'Canvas',
      description: 'Pages',
      layoutType: 'fixed_layout',
      bookType: 'picture_book',
      publishingStatus: 'approved',
      processingStatus: 'ready',
      publishedAt: '2026-01-01T00:00:00.000Z',
      ownerId: 1,
      categories: [],
    });
    mockStartSession.mockRejectedValue(
      new ApiError({
        message: 'open',
        code: 'READING_SESSION_ALREADY_OPEN',
        statusCode: 409,
      }),
    );
    mockGetCurrentSession.mockResolvedValue({
      id: 55,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      userId: 2,
      bookId: 9,
      layoutType: 'fixed_layout',
      startedAt: '2026-01-01T00:00:00.000Z',
      endedAt: null,
      activeDurationMs: 0,
      idleDurationMs: 0,
      spreadIndex: 0,
      pageNumber: 1,
    });
    mockCreateGrant.mockResolvedValue({
      bookId: 9,
      bookAssetId: 3,
      kind: 'source',
      url: 'https://example.test/x',
      expiresAt: '2026-08-15T16:05:00.000Z',
      contentType: 'application/pdf',
      byteSize: 12,
      checksumSha256: null,
      isEncrypted: true,
    });
    const actual = await openReadingShell(9);
    expect(actual.engine).toBe('fixed_layout');
    expect(actual.session.id).toBe(55);
    expect(actual.deliveryGrant?.bookAssetId).toBe(3);
  });
});
