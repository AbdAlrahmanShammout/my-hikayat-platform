const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalizes an exact email filter. Returns undefined when empty or not an email.
 */
export function parseExactEmail(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized: string = value.trim().toLowerCase();
  if (normalized === '' || !EMAIL_PATTERN.test(normalized)) {
    return undefined;
  }
  return normalized;
}
