import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  updateAdminBook,
  type UpdateAdminBookInput,
} from '@/features/books/api/update-admin-book';
import { invalidateAdminBooksQueries } from '@/features/books/lib/invalidate-admin-books-queries';
import type { components } from '@/generated/admin';

/**
 * PATCH /admin/books/:id metadata mutation.
 */
export function useUpdateAdminBook(): UseMutationResult<
  components['schemas']['BookResponse'],
  Error,
  UpdateAdminBookInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminBook,
    onSuccess: async () => {
      await invalidateAdminBooksQueries(queryClient);
    },
  });
}
