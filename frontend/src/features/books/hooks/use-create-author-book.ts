import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { createAuthorBook } from '@/features/books/api/create-author-book';
import { invalidateAuthorBooksQueries } from '@/features/books/lib/invalidate-author-books-queries';
import type { components } from '@/generated/author';

/**
 * POST /author/books mutation.
 */
export function useCreateAuthorBook(): UseMutationResult<
  components['schemas']['BookResponse'],
  Error,
  components['schemas']['CreateBookRequestDto']
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAuthorBook,
    onSuccess: async () => {
      await invalidateAuthorBooksQueries(queryClient);
    },
  });
}
