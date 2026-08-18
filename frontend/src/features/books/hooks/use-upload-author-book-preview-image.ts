import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import {
  uploadAuthorBookPreviewImage,
  type UploadAuthorBookPreviewImageInput,
} from '@/features/books/api/upload-author-book-preview-image';
import type { components } from '@/generated/author';

/**
 * POST /author/books/:bookId/preview-image mutation.
 */
export function useUploadAuthorBookPreviewImage(): UseMutationResult<
  components['schemas']['BookAssetResponse'],
  Error,
  UploadAuthorBookPreviewImageInput
> {
  return useMutation({
    mutationFn: uploadAuthorBookPreviewImage,
  });
}
