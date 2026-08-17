import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { deleteAdminCollection } from '@/features/collections/api/delete-admin-collection';
import { invalidateAdminCollectionsQueries } from '@/features/collections/lib/invalidate-admin-collections-queries';
import type { components } from '@/generated/admin';

/**
 * DELETE /admin/collections/:id mutation.
 */
export function useDeleteAdminCollection(): UseMutationResult<
  components['schemas']['CollectionResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminCollection,
    onSuccess: async () => {
      await invalidateAdminCollectionsQueries(queryClient);
    },
  });
}
