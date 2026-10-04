import { requestJson } from '@/api/request-json';
import { toSearchParams } from '@/lib/to-search-params';

export const ADMIN_SEARCH_TYPES = [
  'users',
  'books',
  'epubAuthors',
  'publishers',
  'categories',
  'subscriptions',
] as const;

export type AdminSearchType = (typeof ADMIN_SEARCH_TYPES)[number];

export type AdminSearchGroup<TItem> = {
  readonly items: readonly TItem[];
  readonly total: number;
};

export type AdminSearchResponse = {
  readonly query: string;
  readonly users: AdminSearchGroup<{
    readonly id: number;
    readonly email: string;
    readonly displayName: string | null;
    readonly role: string;
    readonly isPublisher: boolean;
  }>;
  readonly books: AdminSearchGroup<{
    readonly id: number;
    readonly title: string;
    readonly publishingStatus: string;
    readonly authorName: string | null;
    readonly publisherName: string | null;
    readonly ownerId: number;
  }>;
  readonly epubAuthors: AdminSearchGroup<{
    readonly creator: string;
    readonly bookCount: number;
  }>;
  readonly publishers: AdminSearchResponse['users'];
  readonly categories: AdminSearchGroup<{
    readonly id: number;
    readonly name: string;
    readonly slug: string;
  }>;
  readonly subscriptions: AdminSearchGroup<{
    readonly id: number;
    readonly userId: number;
    readonly userEmail: string;
    readonly status: string;
    readonly planName: string;
    readonly readingAccessState: string;
  }>;
};

export type AdminSearchQuery = {
  readonly q: string;
  readonly type?: AdminSearchType;
  readonly limit?: number;
  readonly offset?: number;
};

/**
 * Global admin search. EPUB authors are creator strings and have no user id.
 */
export async function searchAdmin(query: AdminSearchQuery): Promise<AdminSearchResponse> {
  return requestJson<AdminSearchResponse>({
    path: `/admin/search${toSearchParams(query)}`,
    method: 'GET',
  });
}
