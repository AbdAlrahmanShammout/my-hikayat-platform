/**
 * Parses a route or search value as a positive integer. Rejects padded or partial numbers.
 */
export function parsePositiveInt(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }
  const trimmed: string = value.trim();
  if (!/^[1-9]\d*$/.test(trimmed)) {
    return null;
  }
  return Number.parseInt(trimmed, 10);
}
