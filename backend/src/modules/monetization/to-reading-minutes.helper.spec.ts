import { toReadingMinutes } from './to-reading-minutes.helper';

describe('toReadingMinutes', () => {
  it('divides active reading plus spread milliseconds by 60000 without extra rounding', () => {
    const actualMinutes = toReadingMinutes({
      totalActiveReadingMs: 90_000,
      totalActiveSpreadMs: 0,
      totalVisualSceneTimeMs: 45_000,
      totalWeightedEngagement: 9,
    });
    expect(actualMinutes).toBe(1.5);
  });

  it('excludes visual scene time and weighted engagement from the minute total', () => {
    const actualMinutes = toReadingMinutes({
      totalActiveReadingMs: 60_000,
      totalActiveSpreadMs: 120_000,
      totalVisualSceneTimeMs: 999_000,
      totalWeightedEngagement: 42,
    });
    expect(actualMinutes).toBe(3);
  });
});
