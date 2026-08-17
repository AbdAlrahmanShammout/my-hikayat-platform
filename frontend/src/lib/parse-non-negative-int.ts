/**
 * Parses a search value as an integer >= 0. Rejects padded or partial numbers.
 */
export function parseNonNegativeInt(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }
  const trimmed: string = value.trim();
  if (!/^(0|[1-9]\d*)$/.test(trimmed)) {
    return null;
  }
  return Number.parseInt(trimmed, 10);
}
