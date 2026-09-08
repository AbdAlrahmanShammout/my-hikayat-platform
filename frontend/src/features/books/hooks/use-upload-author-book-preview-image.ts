import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  uploadAuthorBookPreviewImage,
  type UploadAuthorBookPreviewImageInput,
} from '@/features/books/api/upload-author-book-preview-image';
import { invalidateAuthorBooksQueries } from '@/features/books/lib/invalidate-author-books-queries';
import type { components } from '@/generated/author';

/**
 * POST /author/books/:bookId/preview-image mutation.
 */
export function useUploadAuthorBookPreviewImage(): UseMutationResult<
  components['schemas']['BookAssetResponse'],
  Error,
  UploadAuthorBookPreviewImageInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAuthorBookPreviewImage,
    onSuccess: async () => {
      await invalidateAuthorBooksQueries(queryClient);
    },
  });
}
