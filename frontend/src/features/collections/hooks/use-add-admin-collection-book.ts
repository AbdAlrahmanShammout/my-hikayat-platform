import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  addAdminCollectionBook,
  type AddAdminCollectionBookInput,
} from '@/features/collections/api/add-admin-collection-book';
import { invalidateAdminCollectionsQueries } from '@/features/collections/lib/invalidate-admin-collections-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/collections/:id/books mutation.
 */
export function useAddAdminCollectionBook(): UseMutationResult<
  components['schemas']['CollectionResponse'],
  Error,
  AddAdminCollectionBookInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAdminCollectionBook,
    onSuccess: async () => {
      await invalidateAdminCollectionsQueries(queryClient);
    },
  });
}
