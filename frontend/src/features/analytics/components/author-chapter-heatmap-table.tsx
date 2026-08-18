import type { JSX } from 'react';

import { AuthorHeatmapIntensityBar } from '@/features/analytics/components/author-heatmap-intensity-bar';
import { formatDurationMs } from '@/features/analytics/lib/format-duration-ms';
import { formatHeatmapChapterTitle } from '@/features/analytics/lib/format-heatmap-chapter-title';
import { getHeatmapBarPercent } from '@/features/analytics/lib/get-heatmap-bar-percent';
import type { components } from '@/generated/author';

type AuthorChapterHeatmapTableProps = {
  readonly chapters: ReadonlyArray<components['schemas']['AuthorBookChapterHeatmapCellResponse']>;
};

/**
 * Reflowable chapter heatmap cells in the order returned by the API.
 */
export function AuthorChapterHeatmapTable({
  chapters,
}: AuthorChapterHeatmapTableProps): JSX.Element {
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
          <AuthorHeatmapIntensityBar
            percent={getHeatmapBarPercent(cell.activeDurationMs, maxActiveDurationMs)}
          />
        </div>
      ))}
    </div>
  );
}
