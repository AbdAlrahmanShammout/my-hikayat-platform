import {
  BOOK_PUBLISHING_STATUS_FILTERS,
  type BookPublishingStatusFilter,
} from '@/features/books/lib/book-publishing-status-filters';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export type AdminBooksListSearch = {
  readonly publishingStatus: BookPublishingStatusFilter | undefined;
  readonly offset: number;
};

/**
 * Reads list filters from the URL. Unknown status values are ignored.
 */
export function parseAdminBooksListSearch(searchParams: URLSearchParams): AdminBooksListSearch {
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
