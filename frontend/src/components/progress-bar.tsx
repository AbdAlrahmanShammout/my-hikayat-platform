import type { JSX } from 'react';

import { cn } from '@/lib/cn';

type ProgressBarProps = {
  readonly value: number;
  readonly label: string;
};

/**
 * Accessible percent bar. Width is runtime-dynamic from the API percent.
 */
export function ProgressBar({ value, label }: ProgressBarProps): JSX.Element {
  const clampedValue: number = clampPercent(value);
  return (
    <div className="space-y-2">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedValue}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn('h-full rounded-full bg-primary')}
          style={{ width: `${String(clampedValue)}%` }}
        />
      </div>
      <p className="text-sm font-medium tabular-nums">{`${String(clampedValue)}%`}</p>
    </div>
  );
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return Math.floor(value);
}
