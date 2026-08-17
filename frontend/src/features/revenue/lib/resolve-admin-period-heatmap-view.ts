import type { components } from '@/generated/admin';

export type AdminPeriodHeatmapView =
  | {
      readonly kind: 'spreads';
      readonly spreads: ReadonlyArray<components['schemas']['AuthorBookHeatmapCellResponse']>;
    }
  | {
      readonly kind: 'chapters';
      readonly chapters: ReadonlyArray<
        components['schemas']['AuthorBookChapterHeatmapCellResponse']
      >;
    }
  | {
      readonly kind: 'empty';
    };

/**
 * Selects the layout-aware heatmap cells the API returned. Does not invent cells.
 */
export function resolveAdminPeriodHeatmapView(
  heatmap: components['schemas']['GetAdminPeriodBookHeatmapResponseDto'],
): AdminPeriodHeatmapView {
  if (heatmap.layoutType === 'fixed_layout') {
    return { kind: 'spreads', spreads: heatmap.spreads };
  }
  if (heatmap.layoutType === 'reflowable') {
    return { kind: 'chapters', chapters: heatmap.chapters };
  }
  return { kind: 'empty' };
}
