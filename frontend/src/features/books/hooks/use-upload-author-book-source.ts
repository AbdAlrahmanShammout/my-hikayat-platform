import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  uploadAuthorBookSource,
  type UploadAuthorBookSourceInput,
} from '@/features/books/api/upload-author-book-source';
import { invalidateAuthorBooksQueries } from '@/features/books/lib/invalidate-author-books-queries';
import type { components } from '@/generated/author';

/**
 * POST /author/books/:bookId/source mutation.
 */
export function useUploadAuthorBookSource(): UseMutationResult<
  components['schemas']['BookAssetResponse'],
  Error,
  UploadAuthorBookSourceInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAuthorBookSource,
    onSuccess: async () => {
      await invalidateAuthorBooksQueries(queryClient);
    },
  });
}
