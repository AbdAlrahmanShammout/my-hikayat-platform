const BOOK_ENUM_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_review: 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
  not_started: 'Not started',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
  reflowable: 'Reflowable',
  fixed_layout: 'Fixed layout',
  standard_chapter: 'Standard chapter',
  picture_book: 'Picture book',
  illustrated_chapter: 'Illustrated chapter',
};

/**
 * Presents a backend enum value without changing its meaning.
 */
export function formatBookEnumLabel(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Unknown';
  }
  return BOOK_ENUM_LABELS[value] ?? value;
}
