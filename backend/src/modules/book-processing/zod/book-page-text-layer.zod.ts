import { z } from 'zod';

import { BaseZodSchema, ZodNumber, ZodString } from '@/common/base/base.zod';
import { BookPageTextRunZodType } from '@/modules/book-processing/zod/book-page-text-run.zod';

export type BookPageTextLayerZodType = z.infer<typeof BookPageTextLayerZodSchema>;

export const BookPageTextLayerZodSchema = BaseZodSchema.extend({
  pageId: ZodNumber,
  bookId: ZodNumber,
  contentText: ZodString,
  runs: (z.any().nullish() as z.ZodType<BookPageTextRunZodType[] | null | undefined>).optional(),
});
