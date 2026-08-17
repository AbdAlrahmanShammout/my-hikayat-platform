import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  removeAdminCollectionBook,
  type RemoveAdminCollectionBookInput,
} from '@/features/collections/api/remove-admin-collection-book';
import { invalidateAdminCollectionsQueries } from '@/features/collections/lib/invalidate-admin-collections-queries';
import type { components } from '@/generated/admin';

/**
 * DELETE /admin/collections/:id/books/:bookId mutation.
 */
export function useRemoveAdminCollectionBook(): UseMutationResult<
  components['schemas']['CollectionResponse'],
  Error,
  RemoveAdminCollectionBookInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeAdminCollectionBook,
    onSuccess: async () => {
      await invalidateAdminCollectionsQueries(queryClient);
    },
  });
}
