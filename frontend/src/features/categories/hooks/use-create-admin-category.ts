import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { createAdminCategory } from '@/features/categories/api/create-admin-category';
import { invalidateAdminCategoriesQueries } from '@/features/categories/lib/invalidate-admin-categories-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/categories mutation.
 */
export function useCreateAdminCategory(): UseMutationResult<
  components['schemas']['CategoryResponse'],
  Error,
  components['schemas']['CreateCategoryRequestDto']
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCategory,
    onSuccess: async () => {
      await invalidateAdminCategoriesQueries(queryClient);
    },
  });
}
