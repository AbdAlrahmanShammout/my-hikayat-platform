import { describe, expect, it } from 'vitest';

import { formatHeatmapChapterTitle } from '@/features/analytics/lib/format-heatmap-chapter-title';

describe('formatHeatmapChapterTitle', () => {
  it('returns the chapter title', () => {
    const actualTitle = formatHeatmapChapterTitle('The Harbor');
    expect(actualTitle).toBe('The Harbor');
  });

  it('labels a missing title', () => {
    const actualTitle = formatHeatmapChapterTitle(null);
    expect(actualTitle).toBe('No title');
  });
});
