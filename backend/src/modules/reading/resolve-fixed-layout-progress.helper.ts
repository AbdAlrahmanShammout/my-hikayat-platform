type ResolveFixedLayoutProgressInput = {
  readonly pageNumber: number | null;
  readonly pageCount: number;
  readonly spreadIndex: number | null;
  readonly spreadCount: number;
};

/**
 * Maps stored fixed-layout position to a percent using pages, then spreads.
 */
export function resolveFixedLayoutProgressPercent(
  input: ResolveFixedLayoutProgressInput,
): number {
  if (input.pageCount > 0 && input.pageNumber !== null) {
    return clampPercent(Math.floor((input.pageNumber / input.pageCount) * 100));
  }
  if (input.spreadCount > 0 && input.spreadIndex !== null) {
    return clampPercent(Math.floor(((input.spreadIndex + 1) / input.spreadCount) * 100));
  }
  return 0;
}

function clampPercent(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return value;
}
