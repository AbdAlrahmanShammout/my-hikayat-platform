import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { rejectAdminBook, type RejectAdminBookInput } from '@/features/books/api/reject-admin-book';
import { invalidateAdminBooksQueries } from '@/features/books/lib/invalidate-admin-books-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/books/:id/reject mutation. Body is { reason }.
 */
export function useRejectAdminBook(): UseMutationResult<
  components['schemas']['BookResponse'],
  Error,
  RejectAdminBookInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectAdminBook,
    onSuccess: async () => {
      await invalidateAdminBooksQueries(queryClient);
    },
  });
}
