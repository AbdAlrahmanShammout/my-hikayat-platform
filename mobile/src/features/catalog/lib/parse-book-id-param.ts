/**
 * Parses an untrusted route book id into a positive integer.
 */
export function parseBookIdParam(value: string | string[] | undefined): number | null {
  const raw: string | undefined = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw.trim() === '') {
    return null;
  }
  const parsed: number = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}
