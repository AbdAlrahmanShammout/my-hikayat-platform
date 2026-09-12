const ACCENT_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/**
 * Returns a valid collection accent hex, or null when the API value is unset/invalid.
 */
export function resolveCollectionAccentColor(accentColor: string | null | undefined): string | null {
  if (typeof accentColor !== 'string') {
    return null;
  }
  const trimmed: string = accentColor.trim();
  if (!ACCENT_COLOR_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed.toUpperCase();
}
