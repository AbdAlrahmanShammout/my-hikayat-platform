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
      groupBy: jest.Mock;
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
        groupBy: jest.fn(),
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

  it('sums spread and visual scene time by book for sessions in range', async () => {
    mockPrismaProviderService.readingVisualEngagement.groupBy.mockResolvedValue([
      { bookId: 8, _sum: { activeDurationMs: 180000, visualSceneTimeMs: 90000 } },
    ]);
    const inputStartsAt = new Date('2026-08-01T00:00:00.000Z');
    const inputEndsAt = new Date('2026-09-01T00:00:00.000Z');
    const actualTotals = await readingVisualEngagementPrismaRepository.sumDurationsByBookInRange({
      startsAt: inputStartsAt,
      endsAt: inputEndsAt,
    });
    expect(mockPrismaProviderService.readingVisualEngagement.groupBy).toHaveBeenCalledWith({
      by: ['bookId'],
      where: {
        deletedAt: null,
        layoutType: BookLayoutType.FIXED_LAYOUT,
        session: {
          deletedAt: null,
          startedAt: { gte: inputStartsAt, lt: inputEndsAt },
        },
      },
      _sum: { activeDurationMs: true, visualSceneTimeMs: true },
      orderBy: { bookId: 'asc' },
    });
    expect(actualTotals).toEqual([
      { bookId: 8, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
    ]);
  });

  it('sums spread and visual scene time by spread for sessions in range', async () => {
    mockPrismaProviderService.readingVisualEngagement.groupBy.mockResolvedValue([
      {
        spreadIndex: 1,
        pageNumber: 2,
        _sum: { activeDurationMs: 40000, visualSceneTimeMs: 10000 },
      },
      {
        spreadIndex: 0,
        pageNumber: 1,
        _sum: { activeDurationMs: 180000, visualSceneTimeMs: 90000 },
      },
    ]);
    const inputStartsAt = new Date('2026-08-01T00:00:00.000Z');
    const inputEndsAt = new Date('2026-09-01T00:00:00.000Z');
    const actualTotals = await readingVisualEngagementPrismaRepository.sumDurationsBySpreadInRange({
      bookId: 10,
      startsAt: inputStartsAt,
      endsAt: inputEndsAt,
    });
    expect(mockPrismaProviderService.readingVisualEngagement.groupBy).toHaveBeenCalledWith({
      by: ['spreadIndex', 'pageNumber'],
      where: {
        bookId: 10,
        deletedAt: null,
        layoutType: BookLayoutType.FIXED_LAYOUT,
        session: {
          deletedAt: null,
          startedAt: { gte: inputStartsAt, lt: inputEndsAt },
        },
      },
      _sum: { activeDurationMs: true, visualSceneTimeMs: true },
    });
    expect(actualTotals).toEqual([
      { spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
      { spreadIndex: 1, pageNumber: 2, activeDurationMs: 40000, visualSceneTimeMs: 10000 },
    ]);
  });
});
