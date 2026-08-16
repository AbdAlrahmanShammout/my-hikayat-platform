import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingChapterEngagementEntity } from '@/modules/reading-intelligence/entity/reading-chapter-engagement.entity';
import { ReadingChapterEngagementInvalidDurationException } from '@/modules/reading-intelligence/exceptions/reading-chapter-engagement-invalid-duration.exception';
import { ReadingChapterEngagementInvalidPositionException } from '@/modules/reading-intelligence/exceptions/reading-chapter-engagement-invalid-position.exception';

import { ReadingChapterEngagementService } from './reading-chapter-engagement.service';

function createSampleEngagement(): ReadingChapterEngagementEntity {
  return new ReadingChapterEngagementEntity({
    id: 12,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 7,
    bookId: 8,
    sessionId: 9,
    layoutType: BookLayoutType.REFLOWABLE,
    spineIndex: 2,
    activeDurationMs: 15000,
  });
}

describe('ReadingChapterEngagementService', () => {
  let mockReadingChapterEngagementRepository: {
    addDurations: jest.Mock;
    list: jest.Mock;
    findById: jest.Mock;
    sumDurationsByBookInRange: jest.Mock;
    sumDurationsByChapterInRange: jest.Mock;
  };
  let readingChapterEngagementService: ReadingChapterEngagementService;

  beforeEach(() => {
    mockReadingChapterEngagementRepository = {
      addDurations: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      sumDurationsByBookInRange: jest.fn(),
      sumDurationsByChapterInRange: jest.fn(),
    };
    readingChapterEngagementService = new ReadingChapterEngagementService(
      mockReadingChapterEngagementRepository,
    );
  });

  describe('recordReadingChapterEngagement', () => {
    it('accumulates active time for a chapter', async () => {
      const expectedEngagement = createSampleEngagement();
      mockReadingChapterEngagementRepository.addDurations.mockResolvedValue(expectedEngagement);
      const actualEngagement = await readingChapterEngagementService.recordReadingChapterEngagement(
        {
          userId: 7,
          bookId: 8,
          sessionId: 9,
          spineIndex: 2,
          activeDurationMs: 15000,
        },
      );
      expect(mockReadingChapterEngagementRepository.addDurations).toHaveBeenCalledWith(
        {
          userId: 7,
          bookId: 8,
          sessionId: 9,
          layoutType: BookLayoutType.REFLOWABLE,
          spineIndex: 2,
          activeDurationMs: 15000,
        },
        undefined,
      );
      expect(actualEngagement).toBe(expectedEngagement);
    });

    it('rejects a negative spine index', async () => {
      await expect(
        readingChapterEngagementService.recordReadingChapterEngagement({
          userId: 7,
          bookId: 8,
          sessionId: 9,
          spineIndex: -1,
          activeDurationMs: 1000,
        }),
      ).rejects.toBeInstanceOf(ReadingChapterEngagementInvalidPositionException);
      expect(mockReadingChapterEngagementRepository.addDurations).not.toHaveBeenCalled();
    });

    it('rejects a negative duration', async () => {
      await expect(
        readingChapterEngagementService.recordReadingChapterEngagement({
          userId: 7,
          bookId: 8,
          sessionId: 9,
          spineIndex: 2,
          activeDurationMs: -1,
        }),
      ).rejects.toBeInstanceOf(ReadingChapterEngagementInvalidDurationException);
      expect(mockReadingChapterEngagementRepository.addDurations).not.toHaveBeenCalled();
    });
  });

  describe('listReadingChapterEngagements', () => {
    it('lists session chapter engagement rows with pagination defaults', async () => {
      const expectedPage = { entities: [createSampleEngagement()], total: 1 };
      mockReadingChapterEngagementRepository.list.mockResolvedValue(expectedPage);
      const actualPage = await readingChapterEngagementService.listReadingChapterEngagements({
        userId: 7,
        bookId: 8,
        sessionId: 9,
      });
      expect(mockReadingChapterEngagementRepository.list).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        sessionId: 9,
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
      });
      expect(actualPage).toBe(expectedPage);
    });
  });

  describe('sumDurationsByBookInRange', () => {
    it('delegates chapter duration totals for a range', async () => {
      const expectedTotals = [{ bookId: 8, activeDurationMs: 180000 }];
      mockReadingChapterEngagementRepository.sumDurationsByBookInRange.mockResolvedValue(
        expectedTotals,
      );
      const inputRange = {
        startsAt: new Date('2026-08-01T00:00:00.000Z'),
        endsAt: new Date('2026-09-01T00:00:00.000Z'),
      };
      const actualTotals =
        await readingChapterEngagementService.sumDurationsByBookInRange(inputRange);
      expect(mockReadingChapterEngagementRepository.sumDurationsByBookInRange).toHaveBeenCalledWith(
        inputRange,
      );
      expect(actualTotals).toBe(expectedTotals);
    });
  });

  describe('sumDurationsByChapterInRange', () => {
    it('delegates per-chapter duration totals for a book and range', async () => {
      const expectedTotals = [{ spineIndex: 0, activeDurationMs: 180000 }];
      mockReadingChapterEngagementRepository.sumDurationsByChapterInRange.mockResolvedValue(
        expectedTotals,
      );
      const inputRange = {
        bookId: 10,
        startsAt: new Date('2026-08-01T00:00:00.000Z'),
        endsAt: new Date('2026-09-01T00:00:00.000Z'),
      };
      const actualTotals =
        await readingChapterEngagementService.sumDurationsByChapterInRange(inputRange);
      expect(
        mockReadingChapterEngagementRepository.sumDurationsByChapterInRange,
      ).toHaveBeenCalledWith(inputRange);
      expect(actualTotals).toBe(expectedTotals);
    });
  });

  describe('getReadingChapterEngagementById', () => {
    it('throws not found when the row is missing', async () => {
      mockReadingChapterEngagementRepository.findById.mockResolvedValue(null);
      await expect(
        readingChapterEngagementService.getReadingChapterEngagementById(12),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });
});
