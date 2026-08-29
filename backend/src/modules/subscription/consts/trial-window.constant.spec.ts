import { TRIAL_WINDOW, resolveTrialEndsAt } from './trial-window.constant';

describe('TRIAL_WINDOW', () => {
  it('is a seven-day window independent of the refund window constant', () => {
    expect(TRIAL_WINDOW.days).toBe(7);
    const startedAt = new Date('2026-08-01T00:00:00.000Z');
    expect(resolveTrialEndsAt(startedAt).toISOString()).toBe('2026-08-08T00:00:00.000Z');
  });
});
