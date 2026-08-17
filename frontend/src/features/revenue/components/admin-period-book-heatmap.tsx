import type { JSX } from 'react';

import { EmptyState } from '@/components/empty-state';
import { AdminPeriodChapterHeatmapTable } from '@/features/revenue/components/admin-period-chapter-heatmap-table';
import { AdminPeriodSpreadHeatmapTable } from '@/features/revenue/components/admin-period-spread-heatmap-table';
import { formatLayoutType } from '@/features/revenue/lib/format-layout-type';
import { resolveAdminPeriodHeatmapView } from '@/features/revenue/lib/resolve-admin-period-heatmap-view';
import type { components } from '@/generated/admin';

type AdminPeriodBookHeatmapProps = {
  readonly heatmap: components['schemas']['GetAdminPeriodBookHeatmapResponseDto'];
};

/**
 * Layout-aware heatmap: spreads for fixed-layout, chapters for reflowable.
 */
export function AdminPeriodBookHeatmap({ heatmap }: AdminPeriodBookHeatmapProps): JSX.Element {
  const view = resolveAdminPeriodHeatmapView(heatmap);
  if (view.kind === 'spreads') {
    if (view.spreads.length === 0) {
      return (
        <EmptyState
          title="No spread cells"
          description={`layoutType is ${formatLayoutType(heatmap.layoutType)}. The API returned an empty spreads list.`}
        />
      );
    }
    return <AdminPeriodSpreadHeatmapTable spreads={view.spreads} />;
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
    return <AdminPeriodChapterHeatmapTable chapters={view.chapters} />;
  }
  return (
    <EmptyState
      title="No heatmap cells"
      description="layoutType is unknown, so this screen does not invent spread or chapter cells."
    />
  );
}
