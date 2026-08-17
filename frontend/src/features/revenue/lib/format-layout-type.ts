const LAYOUT_TYPE_LABELS: Record<string, string> = {
  reflowable: 'Reflowable',
  fixed_layout: 'Fixed layout',
};

/**
 * Presents a backend layoutType without changing its meaning.
 */
export function formatLayoutType(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Unknown';
  }
  return LAYOUT_TYPE_LABELS[value] ?? value;
}
