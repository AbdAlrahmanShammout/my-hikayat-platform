import type { CSSProperties, JSX } from 'react';

type AuthorHeatmapIntensityBarProps = {
  readonly percent: number;
};

/**
 * Presentational intensity bar from the hottest cell in the heatmap payload.
 */
export function AuthorHeatmapIntensityBar({ percent }: AuthorHeatmapIntensityBarProps): JSX.Element {
  const barStyle: CSSProperties = { width: `${String(percent)}%` };
  return (
    <div className="h-2 w-full rounded bg-muted" aria-hidden="true">
      <div className="h-2 rounded bg-primary" style={barStyle} />
    </div>
  );
}
