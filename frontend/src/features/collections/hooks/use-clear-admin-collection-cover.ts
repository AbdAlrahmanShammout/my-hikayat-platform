import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { clearAdminCollectionCover } from '@/features/collections/api/clear-admin-collection-cover';
import { invalidateAdminCollectionsQueries } from '@/features/collections/lib/invalidate-admin-collections-queries';
import type { components } from '@/generated/admin';

/**
 * DELETE /admin/collections/:id/cover mutation.
 */
export function useClearAdminCollectionCover(): UseMutationResult<
  components['schemas']['CollectionResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearAdminCollectionCover,
    onSuccess: async () => {
      await invalidateAdminCollectionsQueries(queryClient);
    },
  });
}
