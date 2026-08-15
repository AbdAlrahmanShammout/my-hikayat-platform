import { resolveUtcMonthBounds } from './utc-month-bounds.helper';

describe('resolveUtcMonthBounds', () => {
  it('returns the exclusive UTC calendar month that contains the instant', () => {
    const actualBounds = resolveUtcMonthBounds(new Date('2026-08-15T12:00:00.000Z'));
    expect(actualBounds.startsAt.toISOString()).toBe('2026-08-01T00:00:00.000Z');
    expect(actualBounds.endsAt.toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });

  it('advances December into the next UTC year', () => {
    const actualBounds = resolveUtcMonthBounds(new Date('2026-12-31T23:59:59.000Z'));
    expect(actualBounds.startsAt.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(actualBounds.endsAt.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });
});
