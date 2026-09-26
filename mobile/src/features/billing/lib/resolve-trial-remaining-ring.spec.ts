import { resolveTrialRemainingRing } from './resolve-trial-remaining-ring';

describe('resolveTrialRemainingRing', () => {
  it('shows a full ring on the first instant of a 7-day trial', () => {
    const now: Date = new Date('2026-08-29T12:00:00.000Z');
    const actual = resolveTrialRemainingRing({
      trialStartedAt: '2026-08-29T12:00:00.000Z',
      trialEndsAt: '2026-09-05T12:00:00.000Z',
      now,
    });
    expect(actual).toEqual({ dayCount: 7, progress: 1 });
  });

  it('shrinks the ring as whole days pass', () => {
    const now: Date = new Date('2026-08-30T12:00:00.000Z');
    const actual = resolveTrialRemainingRing({
      trialStartedAt: '2026-08-29T12:00:00.000Z',
      trialEndsAt: '2026-09-05T12:00:00.000Z',
      now,
    });
    expect(actual?.dayCount).toBe(6);
    expect(actual?.progress).toBeCloseTo(6 / 7);
  });

  it('returns null when the trial end is missing', () => {
    const actual = resolveTrialRemainingRing({
      trialStartedAt: '2026-08-29T12:00:00.000Z',
      trialEndsAt: null,
      now: new Date('2026-08-30T12:00:00.000Z'),
    });
    expect(actual).toBeNull();
  });
});
