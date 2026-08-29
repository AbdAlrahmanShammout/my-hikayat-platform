import { formatTrialRemainingLabel } from '@/features/billing/lib/format-trial-remaining-label';

describe('formatTrialRemainingLabel', () => {
  const now: Date = new Date('2026-08-29T12:00:00.000Z');

  it('returns null for missing or invalid dates', () => {
    expect(formatTrialRemainingLabel(null, now)).toBeNull();
    expect(formatTrialRemainingLabel('', now)).toBeNull();
    expect(formatTrialRemainingLabel('not-a-date', now)).toBeNull();
  });

  it('formats whole days remaining for display only', () => {
    expect(formatTrialRemainingLabel('2026-09-05T12:00:00.000Z', now)).toBe('7 days remaining');
    expect(formatTrialRemainingLabel('2026-08-30T12:00:00.000Z', now)).toBe('1 day remaining');
  });

  it('formats hours when less than one day remains', () => {
    expect(formatTrialRemainingLabel('2026-08-29T18:00:00.000Z', now)).toBe('6 hours remaining');
    expect(formatTrialRemainingLabel('2026-08-29T12:30:00.000Z', now)).toBe('1 hour remaining');
  });

  it('shows ending-soon copy when the display window is past', () => {
    expect(formatTrialRemainingLabel('2026-08-28T12:00:00.000Z', now)).toBe(
      'Trial ending soon (server decides access)',
    );
  });
});
