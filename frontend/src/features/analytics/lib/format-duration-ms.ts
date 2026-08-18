/**
 * Displays a backend millisecond duration without converting paid-time formulas.
 */
export function formatDurationMs(value: number): string {
  return `${String(value)} ms`;
}
