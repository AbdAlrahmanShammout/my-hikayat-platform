import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  updateAdminCategory,
  type UpdateAdminCategoryInput,
} from '@/features/categories/api/update-admin-category';
import { invalidateAdminCategoriesQueries } from '@/features/categories/lib/invalidate-admin-categories-queries';
import type { components } from '@/generated/admin';

/**
 * PATCH /admin/categories/:id mutation.
 */
export function useUpdateAdminCategory(): UseMutationResult<
  components['schemas']['CategoryResponse'],
  Error,
  UpdateAdminCategoryInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminCategory,
    onSuccess: async () => {
      await invalidateAdminCategoriesQueries(queryClient);
    },
  });
}
