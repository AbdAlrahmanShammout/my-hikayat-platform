import { BOOK_PUBLISHING_STATUS_FILTERS } from '@/features/books/lib/book-publishing-status-filters';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

export const BOOK_PROCESSING_STATUS_FILTERS = [
  'not_started',
  'processing',
  'ready',
  'failed',
] as const;

export const BOOK_TYPE_FILTERS = [
  'standard_chapter',
  'picture_book',
  'illustrated_chapter',
] as const;

export const BOOK_LAYOUT_FILTERS = ['reflowable', 'fixed_layout'] as const;

export const ADMIN_BOOK_SORT_FIELDS = ['createdAt', 'publishedAt', 'title', 'updatedAt'] as const;

export const ADMIN_SORT_ORDERS = ['asc', 'desc'] as const;

export type AdminBooksListSearch = {
  readonly q: string | undefined;
  readonly categoryIds: readonly number[];
  readonly authorName: string | undefined;
  readonly publisherName: string | undefined;
  readonly ownerIds: readonly number[];
  readonly bookTypes: readonly string[];
  readonly layoutTypes: readonly string[];
  readonly publishingStatuses: readonly string[];
  readonly processingStatuses: readonly string[];
  readonly catalogVisible: boolean | undefined;
  readonly sortBy: string | undefined;
  readonly sortOrder: string | undefined;
  readonly offset: number;
};

export const EMPTY_ADMIN_BOOKS_LIST_SEARCH: AdminBooksListSearch = {
  q: undefined,
  categoryIds: [],
  authorName: undefined,
  publisherName: undefined,
  ownerIds: [],
  bookTypes: [],
  layoutTypes: [],
  publishingStatuses: [],
  processingStatuses: [],
  catalogVisible: undefined,
  sortBy: undefined,
  sortOrder: undefined,
  offset: 0,
};

const CATALOG_QUERY_KEYS = [
  'q',
  'categoryId',
  'authorName',
  'publisherName',
  'ownerId',
  'bookType',
  'layoutType',
  'publishingStatus',
  'processingStatus',
  'catalogVisible',
  'sortBy',
  'sortOrder',
  'offset',
] as const;

/**
 * Reads catalog filters from the URL. Unknown enum values are ignored.
 */
export function parseAdminBooksListSearch(searchParams: URLSearchParams): AdminBooksListSearch {
  return {
    q: parseKeyword(searchParams.get('q')),
    categoryIds: parsePositiveIds(searchParams.getAll('categoryId')),
    authorName: parseNonEmpty(searchParams.get('authorName')),
    publisherName: parseNonEmpty(searchParams.get('publisherName')),
    ownerIds: parsePositiveIds(searchParams.getAll('ownerId')),
    bookTypes: keepAllowed(searchParams.getAll('bookType'), BOOK_TYPE_FILTERS),
    layoutTypes: keepAllowed(searchParams.getAll('layoutType'), BOOK_LAYOUT_FILTERS),
    publishingStatuses: keepAllowed(
      searchParams.getAll('publishingStatus'),
      BOOK_PUBLISHING_STATUS_FILTERS,
    ),
    processingStatuses: keepAllowed(
      searchParams.getAll('processingStatus'),
      BOOK_PROCESSING_STATUS_FILTERS,
    ),
    catalogVisible: parseCatalogVisible(searchParams.get('catalogVisible')),
    sortBy: keepAllowed([searchParams.get('sortBy') ?? ''], ADMIN_BOOK_SORT_FIELDS)[0],
    sortOrder: keepAllowed([searchParams.get('sortOrder') ?? ''], ADMIN_SORT_ORDERS)[0],
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}

/**
 * Writes catalog filters onto the current URL, preserving unrelated keys such as section.
 */
export function buildAdminBooksListSearchParams(
  currentParams: URLSearchParams,
  search: AdminBooksListSearch,
): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams(currentParams);
  for (const key of CATALOG_QUERY_KEYS) {
    params.delete(key);
  }
  setOptional(params, 'q', search.q);
  appendAll(params, 'categoryId', search.categoryIds.map(String));
  setOptional(params, 'authorName', search.authorName);
  setOptional(params, 'publisherName', search.publisherName);
  appendAll(params, 'ownerId', search.ownerIds.map(String));
  appendAll(params, 'bookType', search.bookTypes);
  appendAll(params, 'layoutType', search.layoutTypes);
  appendAll(params, 'publishingStatus', search.publishingStatuses);
  appendAll(params, 'processingStatus', search.processingStatuses);
  if (search.catalogVisible !== undefined) {
    params.set('catalogVisible', String(search.catalogVisible));
  }
  setOptional(params, 'sortBy', search.sortBy);
  setOptional(params, 'sortOrder', search.sortOrder);
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}

function parseKeyword(value: string | null): string | undefined {
  const trimmed: string = value?.trim() ?? '';
  return trimmed.length >= 2 ? trimmed : undefined;
}

function parseNonEmpty(value: string | null): string | undefined {
  const trimmed: string = value?.trim() ?? '';
  return trimmed === '' ? undefined : trimmed;
}

function parsePositiveIds(values: readonly string[]): number[] {
  return values.flatMap((value: string) => {
    const parsed: number = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? [parsed] : [];
  });
}

function parseCatalogVisible(value: string | null): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

function keepAllowed(values: readonly string[], allowed: readonly string[]): string[] {
  return values.filter((value: string) => allowed.includes(value));
}

function setOptional(params: URLSearchParams, key: string, value: string | undefined): void {
  if (value !== undefined) {
    params.set(key, value);
  }
}

function appendAll(params: URLSearchParams, key: string, values: readonly string[]): void {
  for (const value of values) {
    params.append(key, value);
  }
}
