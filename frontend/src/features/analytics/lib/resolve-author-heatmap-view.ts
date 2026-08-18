import type { components } from '@/generated/author';

export type AuthorHeatmapView =
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
export function resolveAuthorHeatmapView(
  heatmap: components['schemas']['GetAuthorBookHeatmapResponseDto'],
): AuthorHeatmapView {
  if (heatmap.layoutType === 'fixed_layout') {
    return { kind: 'spreads', spreads: heatmap.spreads };
  }
  if (heatmap.layoutType === 'reflowable') {
    return { kind: 'chapters', chapters: heatmap.chapters };
  }
  return { kind: 'empty' };
}
