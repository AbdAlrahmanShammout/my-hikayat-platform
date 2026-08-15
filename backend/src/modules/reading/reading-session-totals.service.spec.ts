import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { ReadingSessionTotalsService } from './reading-session-totals.service';

describe('ReadingSessionTotalsService', () => {
  it('delegates active-duration totals for a layout and range', async () => {
    const expectedTotals = [{ bookId: 8, activeDurationMs: 120000 }];
    const mockReadingSessionRepository = {
      sumActiveDurationByBookInRange: jest.fn().mockResolvedValue(expectedTotals),
    };
    const readingSessionTotalsService = new ReadingSessionTotalsService(
      mockReadingSessionRepository,
    );
    const inputRange = {
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2026-09-01T00:00:00.000Z'),
      layoutType: BookLayoutType.REFLOWABLE,
    };
    const actualTotals =
      await readingSessionTotalsService.sumActiveDurationByBookInRange(inputRange);
    expect(mockReadingSessionRepository.sumActiveDurationByBookInRange).toHaveBeenCalledWith(
      inputRange,
    );
    expect(actualTotals).toBe(expectedTotals);
  });
});
