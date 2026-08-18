export const BOOK_TYPE_OPTIONS = [
  'standard_chapter',
  'picture_book',
  'illustrated_chapter',
] as const;

export type BookTypeOption = (typeof BOOK_TYPE_OPTIONS)[number];
