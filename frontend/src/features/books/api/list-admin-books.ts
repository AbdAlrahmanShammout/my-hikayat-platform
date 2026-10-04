import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';
import { toSearchParams } from '@/lib/to-search-params';

export type ListAdminBooksQuery = {
  readonly limit?: number;
  readonly offset?: number;
  readonly q?: string;
  readonly categoryId?: readonly number[];
  readonly authorName?: string;
  readonly publisherName?: string;
  readonly ownerId?: number | readonly number[];
  readonly bookType?: readonly string[];
  readonly layoutType?: readonly string[];
  readonly publishingStatus?: string | readonly string[];
  readonly processingStatus?: readonly string[];
  readonly catalogVisible?: boolean;
  readonly sortBy?: string;
  readonly sortOrder?: string;
};

export type AdminBooksListResponse = {
  readonly books: Array<components['schemas']['BookResponse']>;
  readonly total: number;
  readonly appliedFilters?: {
    readonly q?: string;
    readonly categoryId?: readonly number[];
    readonly authorName?: string;
    readonly publisherName?: string;
    readonly ownerId?: readonly number[];
    readonly bookType?: readonly string[];
    readonly layoutType?: readonly string[];
    readonly publishingStatus?: readonly string[];
    readonly processingStatus?: readonly string[];
    readonly catalogVisible?: boolean;
    readonly sortBy?: string;
    readonly sortOrder?: string;
  };
};

/**
 * Lists books for the admin audience. `total` is the filtered catalog count.
 */
export async function listAdminBooks(
  query: ListAdminBooksQuery = {},
): Promise<AdminBooksListResponse> {
  return requestJson<AdminBooksListResponse>({
    path: `/admin/books${toSearchParams(query)}`,
    method: 'GET',
  });
}
