import { describe, expect, it } from 'vitest';

import { resolveAdminPeriodHeatmapView } from '@/features/revenue/lib/resolve-admin-period-heatmap-view';
import type { components } from '@/generated/admin';

function createInputHeatmap(
  overrides: Partial<components['schemas']['GetAdminPeriodBookHeatmapResponseDto']> = {},
): components['schemas']['GetAdminPeriodBookHeatmapResponseDto'] {
  return {
    bookId: 10,
    revenuePeriodId: 4,
    layoutType: 'fixed_layout',
    spreads: [{ spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 }],
    chapters: [],
    ...overrides,
  };
}

describe('resolveAdminPeriodHeatmapView', () => {
  it('uses spreads for fixed-layout books', () => {
    const actualView = resolveAdminPeriodHeatmapView(createInputHeatmap());
    expect(actualView.kind).toBe('spreads');
  });

  it('uses chapters for reflowable books', () => {
    const actualView = resolveAdminPeriodHeatmapView(
      createInputHeatmap({
        layoutType: 'reflowable',
        spreads: [],
        chapters: [{ spineIndex: 0, title: 'The Harbor', activeDurationMs: 120000 }],
      }),
    );
    expect(actualView.kind).toBe('chapters');
  });

  it('is empty when layoutType is unknown', () => {
    const actualView = resolveAdminPeriodHeatmapView(createInputHeatmap({ layoutType: null }));
    expect(actualView.kind).toBe('empty');
  });
});
