import { formatCompactDurationMs } from '@/lib/format-compact-duration';

/**
 * Labels remaining subscription time from backend remainingMs.
 */
export function formatRemainingTimeLabel(remainingMs: number | null | undefined): string | null {
  if (remainingMs === null || remainingMs === undefined) {
    return null;
  }
  if (remainingMs <= 0) {
    return 'Expired';
  }
  return `${formatCompactDurationMs(remainingMs)} remaining`;
}
