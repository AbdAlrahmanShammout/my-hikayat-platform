import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  updateAdminCollection,
  type UpdateAdminCollectionInput,
} from '@/features/collections/api/update-admin-collection';
import { invalidateAdminCollectionsQueries } from '@/features/collections/lib/invalidate-admin-collections-queries';
import type { components } from '@/generated/admin';

/**
 * PATCH /admin/collections/:id mutation.
 */
export function useUpdateAdminCollection(): UseMutationResult<
  components['schemas']['CollectionResponse'],
  Error,
  UpdateAdminCollectionInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminCollection,
    onSuccess: async () => {
      await invalidateAdminCollectionsQueries(queryClient);
    },
  });
}
