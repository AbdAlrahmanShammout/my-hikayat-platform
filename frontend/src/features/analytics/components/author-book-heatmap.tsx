import type { JSX } from 'react';

import { EmptyState } from '@/components/empty-state';
import { AuthorChapterHeatmapTable } from '@/features/analytics/components/author-chapter-heatmap-table';
import { AuthorSpreadHeatmapTable } from '@/features/analytics/components/author-spread-heatmap-table';
import { formatLayoutType } from '@/features/analytics/lib/format-layout-type';
import {
  resolveAuthorHeatmapView,
  type AuthorHeatmapView,
} from '@/features/analytics/lib/resolve-author-heatmap-view';
import type { components } from '@/generated/author';

type AuthorBookHeatmapProps = {
  readonly heatmap: components['schemas']['GetAuthorBookHeatmapResponseDto'];
};

/**
 * Layout-aware heatmap: spreads for fixed-layout, chapters for reflowable.
 */
export function AuthorBookHeatmap({ heatmap }: AuthorBookHeatmapProps): JSX.Element {
  const view: AuthorHeatmapView = resolveAuthorHeatmapView(heatmap);
  if (view.kind === 'spreads') {
    if (view.spreads.length === 0) {
      return (
        <EmptyState
          title="No spread cells"
          description={`layoutType is ${formatLayoutType(heatmap.layoutType)}. The API returned an empty spreads list.`}
        />
      );
    }
    return <AuthorSpreadHeatmapTable spreads={view.spreads} />;
  }
  if (view.kind === 'chapters') {
    if (view.chapters.length === 0) {
      return (
        <EmptyState
          title="No chapter cells"
          description={`layoutType is ${formatLayoutType(heatmap.layoutType)}. The API returned an empty chapters list.`}
        />
      );
    }
    return <AuthorChapterHeatmapTable chapters={view.chapters} />;
  }
  return (
    <EmptyState
      title="No heatmap cells"
      description="layoutType is unknown, so this screen does not invent spread or chapter cells."
    />
  );
}
