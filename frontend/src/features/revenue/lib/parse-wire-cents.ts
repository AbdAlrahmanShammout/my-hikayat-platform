/**
 * Reads a non-negative integer cents value from the wire. Unknown shapes are treated as unset.
 */
export function parseWireCents(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return null;
  }
  return value;
}
