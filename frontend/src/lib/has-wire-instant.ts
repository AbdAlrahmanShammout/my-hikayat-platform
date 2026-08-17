/**
 * Whether an OpenAPI date-like field is present. Generated Date fields may be `unknown`.
 */
export function hasWireInstant(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  return true;
}
