import { requestJson } from '@/api/request-json';
import { toSearchParams } from '@/lib/to-search-params';

export type AdminPublisherListItem = {
  readonly id: number;
  readonly email: string;
  readonly displayName: string | null;
  readonly role: string;
  readonly isPublisher: boolean;
  readonly createdAt: string;
  readonly bookCount: number;
  readonly catalogVisibleBookCount: number;
};

export type AdminPublishersPage = {
  readonly publishers: readonly AdminPublisherListItem[];
  readonly total: number;
};

export type ListAdminPublishersQuery = {
  readonly limit?: number;
  readonly offset?: number;
  readonly q?: string;
  readonly sortBy?: 'createdAt' | 'email' | 'bookCount';
  readonly sortOrder?: 'asc' | 'desc';
};

/**
 * Lists publisher accounts. EPUB creator and EPUB publisher strings are not accounts.
 */
export async function listAdminPublishers(
  query: ListAdminPublishersQuery = {},
): Promise<AdminPublishersPage> {
  return requestJson<AdminPublishersPage>({
    path: `/admin/publishers${toSearchParams(query)}`,
    method: 'GET',
  });
}
