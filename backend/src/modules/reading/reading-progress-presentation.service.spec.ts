import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';

import { ReadingProgressPresentationService } from './reading-progress-presentation.service';

describe('ReadingProgressPresentationService', () => {
  let mockBookProcessingService: {
    listChaptersByBookIds: jest.Mock;
    listPagesByBookIds: jest.Mock;
    listSpreadsByBookIds: jest.Mock;
  };
  let readingProgressPresentationService: ReadingProgressPresentationService;

  beforeEach(() => {
    mockBookProcessingService = {
      listChaptersByBookIds: jest.fn().mockResolvedValue([]),
      listPagesByBookIds: jest.fn().mockResolvedValue([]),
      listSpreadsByBookIds: jest.fn().mockResolvedValue([]),
    };
    readingProgressPresentationService = new ReadingProgressPresentationService(
      mockBookProcessingService as unknown as BookProcessingService,
    );
  });

  it('loads processed structure for the progress book', async () => {
    const inputProgress = new ReadingProgressEntity({
      id: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      userId: 7,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 1,
      scrollOffset: 120,
      spreadIndex: null,
      pageNumber: null,
      lastSessionAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const actualPresentation =
      await readingProgressPresentationService.buildReadingProgressPresentation(inputProgress);
    expect(mockBookProcessingService.listChaptersByBookIds).toHaveBeenCalledWith([8]);
    expect(mockBookProcessingService.listPagesByBookIds).toHaveBeenCalledWith([8]);
    expect(mockBookProcessingService.listSpreadsByBookIds).toHaveBeenCalledWith([8]);
    expect(actualPresentation.contentProgressPercent).toBe(0);
    expect(actualPresentation.locationLabel).toBe('Chapter 2');
  });
});
