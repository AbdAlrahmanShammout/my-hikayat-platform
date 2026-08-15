import { z } from 'zod';

import { BaseZodSchema, ZodNumber, ZodNumberNullable } from '@/common/base/base.zod';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

export type ReadingBookmarkZodType = z.infer<typeof ReadingBookmarkZodSchema>;

export const ReadingBookmarkZodSchema = BaseZodSchema.extend({
  userId: ZodNumber,
  bookId: ZodNumber,
  layoutType: z.nativeEnum(BookLayoutType),
  spineIndex: ZodNumberNullable,
  scrollOffset: ZodNumberNullable,
  spreadIndex: ZodNumberNullable,
  pageNumber: ZodNumberNullable,
});
