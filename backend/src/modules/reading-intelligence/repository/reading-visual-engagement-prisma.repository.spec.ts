import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingVisualEngagementMapper } from '@/modules/reading-intelligence/mapper/reading-visual-engagement.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { ReadingVisualEngagementPrismaRepository } from './reading-visual-engagement-prisma.repository';

describe('ReadingVisualEngagementPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 11,
    createdAt,
    updatedAt,
    deletedAt: null,
    userId: 7,
    bookId: 8,
    sessionId: 9,
    layoutType: BookLayoutType.FIXED_LAYOUT,
    spreadIndex: 1,
    pageNumber: 3,
    activeDurationMs: 15000,
    visualSceneTimeMs: 12000,
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    readingVisualEngagement: {
      upsert: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };
  let readingVisualEngagementPrismaRepository: ReadingVisualEngagementPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      readingVisualEngagement: {
        upsert: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    readingVisualEngagementPrismaRepository = new ReadingVisualEngagementPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('upserts durations for a session spread and page', async () => {
    mockPrismaProviderService.readingVisualEngagement.upsert.mockResolvedValue(persistenceRow);
    const actualEntity = await readingVisualEngagementPrismaRepository.addDurations({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spreadIndex: 1,
      pageNumber: 3,
      activeDurationMs: 15000,
      visualSceneTimeMs: 12000,
    });
    expect(mockPrismaProviderService.readingVisualEngagement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          sessionId_spreadIndex_pageNumber: {
            sessionId: 9,
            spreadIndex: 1,
            pageNumber: 3,
          },
        },
        update: {
          activeDurationMs: { increment: 15000 },
          visualSceneTimeMs: { increment: 12000 },
        },
      }),
    );
    expect(actualEntity).toEqual(ReadingVisualEngagementMapper.toEntity(persistenceRow));
  });

  it('returns a page with a real total', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 2]);
    const actualPage = await readingVisualEngagementPrismaRepository.list({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      limit: 20,
      offset: 0,
    });
    expect(actualPage.total).toBe(2);
    expect(actualPage.entities).toHaveLength(1);
    expect(actualPage.entities[0].id).toBe(11);
  });

  it('returns null when findById misses a visual engagement row', async () => {
    mockPrismaProviderService.readingVisualEngagement.findFirst.mockResolvedValue(null);
    const actualEntity = await readingVisualEngagementPrismaRepository.findById(11);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.readingVisualEngagement.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 11, deletedAt: null },
      }),
    );
  });
});
