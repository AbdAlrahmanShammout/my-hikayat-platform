import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { ReadingIntelligenceService } from '@/modules/reading-intelligence/reading-intelligence.service';

import { BookHeatmapService } from './book-heatmap.service';

function createSamplePeriod(): RevenuePeriodEntity {
  return new RevenuePeriodEntity({
    id: 4,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    startsAt: new Date('2026-08-01T00:00:00.000Z'),
    endsAt: new Date('2026-09-01T00:00:00.000Z'),
    status: RevenuePeriodStatus.OPEN,
    platformCutPercent: 30,
    poolAmountCents: 10000,
  });
}

function createSampleBook(layoutType: BookLayoutType | null): BookEntity {
  return new BookEntity({
    id: 10,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'Heatmap Fixture',
    description: 'Used by book heatmap tests.',
    layoutType,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-01-02T00:00:00.000Z'),
    ownerId: 3,
  });
}

function createSampleChapter(): BookChapterEntity {
  return new BookChapterEntity({
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 10,
    spineIndex: 0,
    href: 'OEBPS/chapter1.xhtml',
    manifestId: 'c1',
    title: 'The Harbor',
    contentText: 'First chapter text.',
  });
}

describe('BookHeatmapService', () => {
  let mockReadingIntelligenceService: {
    listSpreadEngagementTotalsForBook: jest.Mock;
    listChapterEngagementTotalsForBook: jest.Mock;
  };
  let mockBookProcessingService: { listBookChapters: jest.Mock };
  let bookHeatmapService: BookHeatmapService;

  beforeEach(() => {
    mockReadingIntelligenceService = {
      listSpreadEngagementTotalsForBook: jest.fn(),
      listChapterEngagementTotalsForBook: jest.fn(),
    };
    mockBookProcessingService = { listBookChapters: jest.fn() };
    bookHeatmapService = new BookHeatmapService(
      mockReadingIntelligenceService as unknown as ReadingIntelligenceService,
      mockBookProcessingService as unknown as BookProcessingService,
    );
  });

  it('returns spread cells for a fixed-layout book and leaves chapters empty', async () => {
    const expectedSpreads = [
      { spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
    ];
    mockReadingIntelligenceService.listSpreadEngagementTotalsForBook.mockResolvedValue(
      expectedSpreads,
    );
    const actualHeatmap = await bookHeatmapService.getBookHeatmap({
      book: createSampleBook(BookLayoutType.FIXED_LAYOUT),
      period: createSamplePeriod(),
    });
    expect(mockReadingIntelligenceService.listSpreadEngagementTotalsForBook).toHaveBeenCalledWith({
      bookId: 10,
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2026-09-01T00:00:00.000Z'),
    });
    expect(mockBookProcessingService.listBookChapters).not.toHaveBeenCalled();
    expect(actualHeatmap).toEqual({
      bookId: 10,
      revenuePeriodId: 4,
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spreads: expectedSpreads,
      chapters: [],
    });
  });

  it('returns labeled chapter cells for a reflowable book and leaves spreads empty', async () => {
    mockReadingIntelligenceService.listChapterEngagementTotalsForBook.mockResolvedValue([
      { spineIndex: 0, activeDurationMs: 120000 },
      { spineIndex: 99, activeDurationMs: 8000 },
    ]);
    mockBookProcessingService.listBookChapters.mockResolvedValue([createSampleChapter()]);
    const actualHeatmap = await bookHeatmapService.getBookHeatmap({
      book: createSampleBook(BookLayoutType.REFLOWABLE),
      period: createSamplePeriod(),
    });
    expect(mockReadingIntelligenceService.listSpreadEngagementTotalsForBook).not.toHaveBeenCalled();
    expect(actualHeatmap).toEqual({
      bookId: 10,
      revenuePeriodId: 4,
      layoutType: BookLayoutType.REFLOWABLE,
      spreads: [],
      chapters: [
        { spineIndex: 0, title: 'The Harbor', activeDurationMs: 120000 },
        { spineIndex: 99, title: null, activeDurationMs: 8000 },
      ],
    });
  });

  it('returns empty cells when the book layout is unknown', async () => {
    const actualHeatmap = await bookHeatmapService.getBookHeatmap({
      book: createSampleBook(null),
      period: createSamplePeriod(),
    });
    expect(mockReadingIntelligenceService.listSpreadEngagementTotalsForBook).not.toHaveBeenCalled();
    expect(
      mockReadingIntelligenceService.listChapterEngagementTotalsForBook,
    ).not.toHaveBeenCalled();
    expect(actualHeatmap.spreads).toEqual([]);
    expect(actualHeatmap.chapters).toEqual([]);
  });
});
