import {
  BOOK_PUBLISHING_STATUS_FILTERS,
  type BookPublishingStatusFilter,
} from '@/features/books/lib/book-publishing-status-filters';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export type AuthorBooksListSearch = {
  readonly publishingStatus: BookPublishingStatusFilter | undefined;
  readonly offset: number;
};

/**
 * Reads list filters from the URL. Unknown status values are ignored.
 */
export function parseAuthorBooksListSearch(searchParams: URLSearchParams): AuthorBooksListSearch {
  return {
    publishingStatus: parsePublishingStatusFilter(searchParams.get('publishingStatus') ?? undefined),
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}

function parsePublishingStatusFilter(
  value: string | undefined,
): BookPublishingStatusFilter | undefined {
  if (value === undefined) {
    return undefined;
  }
  return BOOK_PUBLISHING_STATUS_FILTERS.find((status) => status === value);
}
