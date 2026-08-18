import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { submitAuthorBookForReview } from '@/features/books/api/submit-author-book-for-review';
import { invalidateAuthorBooksQueries } from '@/features/books/lib/invalidate-author-books-queries';
import type { components } from '@/generated/author';

/**
 * POST /author/books/:bookId/submit-for-review mutation.
 */
export function useSubmitAuthorBookForReview(): UseMutationResult<
  components['schemas']['BookResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitAuthorBookForReview,
    onSuccess: async () => {
      await invalidateAuthorBooksQueries(queryClient);
    },
  });
}
