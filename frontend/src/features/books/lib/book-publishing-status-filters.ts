export const BOOK_PUBLISHING_STATUS_FILTERS = [
  'pending',
  'in_review',
  'approved',
  'rejected',
] as const;

export type BookPublishingStatusFilter = (typeof BOOK_PUBLISHING_STATUS_FILTERS)[number];
