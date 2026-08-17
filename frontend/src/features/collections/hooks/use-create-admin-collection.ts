import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { createAdminCollection } from '@/features/collections/api/create-admin-collection';
import { invalidateAdminCollectionsQueries } from '@/features/collections/lib/invalidate-admin-collections-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/collections mutation.
 */
export function useCreateAdminCollection(): UseMutationResult<
  components['schemas']['CollectionResponse'],
  Error,
  components['schemas']['CreateCollectionRequestDto']
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCollection,
    onSuccess: async () => {
      await invalidateAdminCollectionsQueries(queryClient);
    },
  });
}
