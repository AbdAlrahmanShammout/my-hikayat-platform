import { describe, expect, it } from 'vitest';

import { getHeatmapBarPercent } from '@/features/analytics/lib/get-heatmap-bar-percent';

describe('getHeatmapBarPercent', () => {
  it('returns 100 for the hottest cell', () => {
    const actualPercent = getHeatmapBarPercent(180000, 180000);
    expect(actualPercent).toBe(100);
  });

  it('returns 0 when there is no positive duration', () => {
    const actualPercent = getHeatmapBarPercent(0, 0);
    expect(actualPercent).toBe(0);
  });
});
