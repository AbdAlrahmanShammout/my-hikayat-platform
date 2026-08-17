import type { JSX } from 'react';

import { AdminHeatmapIntensityBar } from '@/features/revenue/components/admin-heatmap-intensity-bar';
import { formatDurationMs } from '@/features/revenue/lib/format-duration-ms';
import { getHeatmapBarPercent } from '@/features/revenue/lib/get-heatmap-bar-percent';
import type { components } from '@/generated/admin';

type AdminPeriodSpreadHeatmapTableProps = {
  readonly spreads: ReadonlyArray<components['schemas']['AuthorBookHeatmapCellResponse']>;
};

/**
 * Fixed-layout spread heatmap cells. Visual scene time is shown and is not paid.
 */
export function AdminPeriodSpreadHeatmapTable({
  spreads,
}: AdminPeriodSpreadHeatmapTableProps): JSX.Element {
  const maxActiveDurationMs: number = spreads.reduce(
    (maxDuration: number, cell) => Math.max(maxDuration, cell.activeDurationMs),
    0,
  );
  return (
    <div className="space-y-3">
      {spreads.map((cell) => (
        <div key={`${cell.spreadIndex}-${cell.pageNumber}`} className="space-y-2 rounded-md border border-border p-4">
          <p className="text-sm font-medium">
            Spread {String(cell.spreadIndex)} · Page {String(cell.pageNumber)}
          </p>
          <p className="text-sm text-muted-foreground">
            activeDurationMs {formatDurationMs(cell.activeDurationMs)}
          </p>
          <p className="text-sm text-muted-foreground">
            visualSceneTimeMs {formatDurationMs(cell.visualSceneTimeMs)}
            <span className="ml-2 text-xs">Not paid</span>
          </p>
          <AdminHeatmapIntensityBar
            percent={getHeatmapBarPercent(cell.activeDurationMs, maxActiveDurationMs)}
          />
        </div>
      ))}
    </div>
  );
}
