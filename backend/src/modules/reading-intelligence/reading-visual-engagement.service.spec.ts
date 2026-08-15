import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';
import { ReadingVisualEngagementInvalidDurationException } from '@/modules/reading-intelligence/exceptions/reading-visual-engagement-invalid-duration.exception';
import { ReadingVisualEngagementInvalidPositionException } from '@/modules/reading-intelligence/exceptions/reading-visual-engagement-invalid-position.exception';

import { ReadingVisualEngagementService } from './reading-visual-engagement.service';

function createSampleEngagement(): ReadingVisualEngagementEntity {
  return new ReadingVisualEngagementEntity({
    id: 11,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 7,
    bookId: 8,
    sessionId: 9,
    layoutType: BookLayoutType.FIXED_LAYOUT,
    spreadIndex: 1,
    pageNumber: 3,
    activeDurationMs: 15000,
    visualSceneTimeMs: 12000,
  });
}

describe('ReadingVisualEngagementService', () => {
  let mockReadingVisualEngagementRepository: {
    addDurations: jest.Mock;
    list: jest.Mock;
    findById: jest.Mock;
  };
  let readingVisualEngagementService: ReadingVisualEngagementService;

  beforeEach(() => {
    mockReadingVisualEngagementRepository = {
      addDurations: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
    };
    readingVisualEngagementService = new ReadingVisualEngagementService(
      mockReadingVisualEngagementRepository,
    );
  });

  describe('recordReadingVisualEngagement', () => {
    it('accumulates active and visual scene time for a spread and page', async () => {
      const expectedEngagement = createSampleEngagement();
      mockReadingVisualEngagementRepository.addDurations.mockResolvedValue(expectedEngagement);
      const actualEngagement = await readingVisualEngagementService.recordReadingVisualEngagement({
        userId: 7,
        bookId: 8,
        sessionId: 9,
        spreadIndex: 1,
        pageNumber: 3,
        activeDurationMs: 15000,
        visualSceneTimeMs: 12000,
      });
      expect(mockReadingVisualEngagementRepository.addDurations).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        sessionId: 9,
        layoutType: BookLayoutType.FIXED_LAYOUT,
        spreadIndex: 1,
        pageNumber: 3,
        activeDurationMs: 15000,
        visualSceneTimeMs: 12000,
      });
      expect(actualEngagement).toBe(expectedEngagement);
    });

    it('rejects a page number below 1', async () => {
      await expect(
        readingVisualEngagementService.recordReadingVisualEngagement({
          userId: 7,
          bookId: 8,
          sessionId: 9,
          spreadIndex: 1,
          pageNumber: 0,
          activeDurationMs: 1000,
          visualSceneTimeMs: 800,
        }),
      ).rejects.toBeInstanceOf(ReadingVisualEngagementInvalidPositionException);
      expect(mockReadingVisualEngagementRepository.addDurations).not.toHaveBeenCalled();
    });

    it('rejects a negative duration', async () => {
      await expect(
        readingVisualEngagementService.recordReadingVisualEngagement({
          userId: 7,
          bookId: 8,
          sessionId: 9,
          spreadIndex: 1,
          pageNumber: 3,
          activeDurationMs: -1,
          visualSceneTimeMs: 0,
        }),
      ).rejects.toBeInstanceOf(ReadingVisualEngagementInvalidDurationException);
      expect(mockReadingVisualEngagementRepository.addDurations).not.toHaveBeenCalled();
    });
  });

  describe('listReadingVisualEngagements', () => {
    it('lists session visual engagement rows with pagination defaults', async () => {
      const expectedPage = { entities: [createSampleEngagement()], total: 1 };
      mockReadingVisualEngagementRepository.list.mockResolvedValue(expectedPage);
      const actualPage = await readingVisualEngagementService.listReadingVisualEngagements({
        userId: 7,
        bookId: 8,
        sessionId: 9,
      });
      expect(mockReadingVisualEngagementRepository.list).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        sessionId: 9,
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
      });
      expect(actualPage).toBe(expectedPage);
    });
  });

  describe('getReadingVisualEngagementById', () => {
    it('throws not found when the row is missing', async () => {
      mockReadingVisualEngagementRepository.findById.mockResolvedValue(null);
      await expect(
        readingVisualEngagementService.getReadingVisualEngagementById(11),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });
});
