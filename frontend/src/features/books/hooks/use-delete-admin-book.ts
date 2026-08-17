import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { deleteAdminBook } from '@/features/books/api/delete-admin-book';
import { invalidateAdminBooksQueries } from '@/features/books/lib/invalidate-admin-books-queries';
import type { components } from '@/generated/admin';

/**
 * DELETE /admin/books/:id mutation.
 */
export function useDeleteAdminBook(): UseMutationResult<
  components['schemas']['BookResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminBook,
    onSuccess: async () => {
      await invalidateAdminBooksQueries(queryClient);
    },
  });
}
