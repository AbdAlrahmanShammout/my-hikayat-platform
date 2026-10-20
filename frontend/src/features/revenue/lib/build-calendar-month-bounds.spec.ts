import { describe, expect, it } from 'vitest';

import { buildCalendarMonthBounds } from '@/features/revenue/lib/build-calendar-month-bounds';

describe('buildCalendarMonthBounds', () => {
  it('covers August through the first instant of September', () => {
    expect(buildCalendarMonthBounds('2026-08')).toEqual({
      startsAt: '2026-08-01T00:00:00.000Z',
      endsAt: '2026-09-01T00:00:00.000Z',
    });
  });

  it('rolls December into January of the next year', () => {
    expect(buildCalendarMonthBounds('2026-12')).toEqual({
      startsAt: '2026-12-01T00:00:00.000Z',
      endsAt: '2027-01-01T00:00:00.000Z',
    });
  });

  it('rejects a value that is not a calendar month', () => {
    expect(buildCalendarMonthBounds('2026-13')).toBeNull();
  });
});
