import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { republishAdminBook } from '@/features/books/api/republish-admin-book';
import { invalidateAdminBooksQueries } from '@/features/books/lib/invalidate-admin-books-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/books/:id/republish mutation.
 */
export function useRepublishAdminBook(): UseMutationResult<
  components['schemas']['BookResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: republishAdminBook,
    onSuccess: async () => {
      await invalidateAdminBooksQueries(queryClient);
    },
  });
}
