import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { unpublishAdminBook } from '@/features/books/api/unpublish-admin-book';
import { invalidateAdminBooksQueries } from '@/features/books/lib/invalidate-admin-books-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/books/:id/unpublish mutation.
 */
export function useUnpublishAdminBook(): UseMutationResult<
  components['schemas']['BookResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unpublishAdminBook,
    onSuccess: async () => {
      await invalidateAdminBooksQueries(queryClient);
    },
  });
}
