import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { approveAdminBook } from '@/features/books/api/approve-admin-book';
import { invalidateAdminBooksQueries } from '@/features/books/lib/invalidate-admin-books-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/books/:id/approve mutation.
 */
export function useApproveAdminBook(): UseMutationResult<
  components['schemas']['BookResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveAdminBook,
    onSuccess: async () => {
      await invalidateAdminBooksQueries(queryClient);
    },
  });
}
