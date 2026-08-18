import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import {
  uploadAuthorBookPromoVideo,
  type UploadAuthorBookPromoVideoInput,
} from '@/features/books/api/upload-author-book-promo-video';
import type { components } from '@/generated/author';

/**
 * POST /author/books/:bookId/promo-video mutation.
 */
export function useUploadAuthorBookPromoVideo(): UseMutationResult<
  components['schemas']['BookAssetResponse'],
  Error,
  UploadAuthorBookPromoVideoInput
> {
  return useMutation({
    mutationFn: uploadAuthorBookPromoVideo,
  });
}
