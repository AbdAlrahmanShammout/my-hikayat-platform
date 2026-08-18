import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  updateAuthorBook,
  type UpdateAuthorBookInput,
} from '@/features/books/api/update-author-book';
import { invalidateAuthorBooksQueries } from '@/features/books/lib/invalidate-author-books-queries';
import type { components } from '@/generated/author';

/**
 * PATCH /author/books/:id metadata mutation.
 */
export function useUpdateAuthorBook(): UseMutationResult<
  components['schemas']['BookResponse'],
  Error,
  UpdateAuthorBookInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAuthorBook,
    onSuccess: async () => {
      await invalidateAuthorBooksQueries(queryClient);
    },
  });
}
