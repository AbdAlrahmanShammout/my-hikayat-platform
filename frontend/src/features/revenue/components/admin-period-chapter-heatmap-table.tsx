import type { JSX } from 'react';

import { AdminHeatmapIntensityBar } from '@/features/revenue/components/admin-heatmap-intensity-bar';
import { formatDurationMs } from '@/features/revenue/lib/format-duration-ms';
import { formatHeatmapChapterTitle } from '@/features/revenue/lib/format-heatmap-chapter-title';
import { getHeatmapBarPercent } from '@/features/revenue/lib/get-heatmap-bar-percent';
import type { components } from '@/generated/admin';

type AdminPeriodChapterHeatmapTableProps = {
  readonly chapters: ReadonlyArray<components['schemas']['AuthorBookChapterHeatmapCellResponse']>;
};

/**
 * Reflowable chapter heatmap cells in the order returned by the API.
 */
export function AdminPeriodChapterHeatmapTable({
  chapters,
}: AdminPeriodChapterHeatmapTableProps): JSX.Element {
  const maxActiveDurationMs: number = chapters.reduce(
    (maxDuration: number, cell) => Math.max(maxDuration, cell.activeDurationMs),
    0,
  );
  return (
    <div className="space-y-3">
      {chapters.map((cell) => (
        <div key={cell.spineIndex} className="space-y-2 rounded-md border border-border p-4">
          <p className="text-sm font-medium">
            Spine {String(cell.spineIndex)} · {formatHeatmapChapterTitle(cell.title)}
          </p>
          <p className="text-sm text-muted-foreground">
            activeDurationMs {formatDurationMs(cell.activeDurationMs)}
          </p>
          <AdminHeatmapIntensityBar
            percent={getHeatmapBarPercent(cell.activeDurationMs, maxActiveDurationMs)}
          />
        </div>
      ))}
    </div>
  );
}
