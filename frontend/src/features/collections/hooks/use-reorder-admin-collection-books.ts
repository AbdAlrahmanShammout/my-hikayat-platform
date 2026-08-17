import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  reorderAdminCollectionBooks,
  type ReorderAdminCollectionBooksInput,
} from '@/features/collections/api/reorder-admin-collection-books';
import { invalidateAdminCollectionsQueries } from '@/features/collections/lib/invalidate-admin-collections-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/collections/:id/reorder mutation.
 */
export function useReorderAdminCollectionBooks(): UseMutationResult<
  components['schemas']['CollectionResponse'],
  Error,
  ReorderAdminCollectionBooksInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderAdminCollectionBooks,
    onSuccess: async () => {
      await invalidateAdminCollectionsQueries(queryClient);
    },
  });
}
