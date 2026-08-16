import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingChapterEngagementMapper } from '@/modules/reading-intelligence/mapper/reading-chapter-engagement.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { ReadingChapterEngagementPrismaRepository } from './reading-chapter-engagement-prisma.repository';

describe('ReadingChapterEngagementPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 12,
    createdAt,
    updatedAt,
    deletedAt: null,
    userId: 7,
    bookId: 8,
    sessionId: 9,
    layoutType: BookLayoutType.REFLOWABLE,
    spineIndex: 2,
    activeDurationMs: 15000,
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    readingChapterEngagement: {
      upsert: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      groupBy: jest.Mock;
    };
  };
  let readingChapterEngagementPrismaRepository: ReadingChapterEngagementPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      readingChapterEngagement: {
        upsert: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    };
    readingChapterEngagementPrismaRepository = new ReadingChapterEngagementPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('upserts active duration for a session chapter', async () => {
    mockPrismaProviderService.readingChapterEngagement.upsert.mockResolvedValue(persistenceRow);
    const actualEntity = await readingChapterEngagementPrismaRepository.addDurations({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 2,
      activeDurationMs: 15000,
    });
    expect(mockPrismaProviderService.readingChapterEngagement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          sessionId_spineIndex: {
            sessionId: 9,
            spineIndex: 2,
          },
        },
        update: {
          activeDurationMs: { increment: 15000 },
        },
      }),
    );
    expect(actualEntity).toEqual(ReadingChapterEngagementMapper.toEntity(persistenceRow));
  });

  it('returns a page with a real total', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 2]);
    const actualPage = await readingChapterEngagementPrismaRepository.list({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      limit: 20,
      offset: 0,
    });
    expect(actualPage.total).toBe(2);
    expect(actualPage.entities).toHaveLength(1);
    expect(actualPage.entities[0].id).toBe(12);
  });

  it('returns null when findById misses a chapter engagement row', async () => {
    mockPrismaProviderService.readingChapterEngagement.findFirst.mockResolvedValue(null);
    const actualEntity = await readingChapterEngagementPrismaRepository.findById(12);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.readingChapterEngagement.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 12, deletedAt: null },
      }),
    );
  });

  it('sums chapter active time by book for sessions in range', async () => {
    mockPrismaProviderService.readingChapterEngagement.groupBy.mockResolvedValue([
      { bookId: 8, _sum: { activeDurationMs: 180000 } },
    ]);
    const inputStartsAt = new Date('2026-08-01T00:00:00.000Z');
    const inputEndsAt = new Date('2026-09-01T00:00:00.000Z');
    const actualTotals = await readingChapterEngagementPrismaRepository.sumDurationsByBookInRange({
      startsAt: inputStartsAt,
      endsAt: inputEndsAt,
    });
    expect(mockPrismaProviderService.readingChapterEngagement.groupBy).toHaveBeenCalledWith({
      by: ['bookId'],
      where: {
        deletedAt: null,
        layoutType: BookLayoutType.REFLOWABLE,
        session: {
          deletedAt: null,
          startedAt: { gte: inputStartsAt, lt: inputEndsAt },
        },
      },
      _sum: { activeDurationMs: true },
      orderBy: { bookId: 'asc' },
    });
    expect(actualTotals).toEqual([{ bookId: 8, activeDurationMs: 180000 }]);
  });

  it('sums active time by chapter for sessions in range', async () => {
    mockPrismaProviderService.readingChapterEngagement.groupBy.mockResolvedValue([
      { spineIndex: 1, _sum: { activeDurationMs: 40000 } },
      { spineIndex: 0, _sum: { activeDurationMs: 180000 } },
    ]);
    const inputStartsAt = new Date('2026-08-01T00:00:00.000Z');
    const inputEndsAt = new Date('2026-09-01T00:00:00.000Z');
    const actualTotals =
      await readingChapterEngagementPrismaRepository.sumDurationsByChapterInRange({
        bookId: 10,
        startsAt: inputStartsAt,
        endsAt: inputEndsAt,
      });
    expect(mockPrismaProviderService.readingChapterEngagement.groupBy).toHaveBeenCalledWith({
      by: ['spineIndex'],
      where: {
        bookId: 10,
        deletedAt: null,
        layoutType: BookLayoutType.REFLOWABLE,
        session: {
          deletedAt: null,
          startedAt: { gte: inputStartsAt, lt: inputEndsAt },
        },
      },
      _sum: { activeDurationMs: true },
    });
    expect(actualTotals).toEqual([
      { spineIndex: 0, activeDurationMs: 180000 },
      { spineIndex: 1, activeDurationMs: 40000 },
    ]);
  });
});
