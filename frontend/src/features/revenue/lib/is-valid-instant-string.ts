/**
 * True when the string parses as a finite instant the API can accept.
 */
export function isValidInstantString(value: string): boolean {
  const parsed: Date = new Date(value);
  return !Number.isNaN(parsed.getTime());
}
