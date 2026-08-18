import { describe, expect, it } from 'vitest';

import { resolveAuthorHeatmapView } from '@/features/analytics/lib/resolve-author-heatmap-view';
import type { components } from '@/generated/author';

function createInputHeatmap(
  overrides: Partial<components['schemas']['GetAuthorBookHeatmapResponseDto']> = {},
): components['schemas']['GetAuthorBookHeatmapResponseDto'] {
  return {
    bookId: 10,
    revenuePeriodId: 4,
    layoutType: 'fixed_layout',
    spreads: [{ spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 }],
    chapters: [],
    ...overrides,
  };
}

describe('resolveAuthorHeatmapView', () => {
  it('uses spreads for fixed-layout books', () => {
    const actualView = resolveAuthorHeatmapView(createInputHeatmap());
    expect(actualView.kind).toBe('spreads');
  });

  it('uses chapters for reflowable books', () => {
    const actualView = resolveAuthorHeatmapView(
      createInputHeatmap({
        layoutType: 'reflowable',
        spreads: [],
        chapters: [{ spineIndex: 0, title: 'The Harbor', activeDurationMs: 120000 }],
      }),
    );
    expect(actualView.kind).toBe('chapters');
  });

  it('is empty when layoutType is unknown', () => {
    const actualView = resolveAuthorHeatmapView(createInputHeatmap({ layoutType: null }));
    expect(actualView.kind).toBe('empty');
  });
});
