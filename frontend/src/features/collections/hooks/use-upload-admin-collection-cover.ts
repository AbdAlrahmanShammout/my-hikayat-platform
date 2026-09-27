import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  uploadAdminCollectionCover,
  type UploadAdminCollectionCoverInput,
} from '@/features/collections/api/upload-admin-collection-cover';
import { invalidateAdminCollectionsQueries } from '@/features/collections/lib/invalidate-admin-collections-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/collections/:id/cover mutation.
 */
export function useUploadAdminCollectionCover(): UseMutationResult<
  components['schemas']['CollectionResponse'],
  Error,
  UploadAdminCollectionCoverInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAdminCollectionCover,
    onSuccess: async () => {
      await invalidateAdminCollectionsQueries(queryClient);
    },
  });
}
