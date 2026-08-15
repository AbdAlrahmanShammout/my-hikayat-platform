import { z } from 'zod';

import { BaseZodSchema, ZodDate, ZodNumber, ZodNumberNullable } from '@/common/base/base.zod';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

export type ReadingProgressZodType = z.infer<typeof ReadingProgressZodSchema>;

export const ReadingProgressZodSchema = BaseZodSchema.extend({
  userId: ZodNumber,
  bookId: ZodNumber,
  layoutType: z.nativeEnum(BookLayoutType),
  spineIndex: ZodNumberNullable,
  scrollOffset: ZodNumberNullable,
  spreadIndex: ZodNumberNullable,
  pageNumber: ZodNumberNullable,
  lastSessionAt: ZodDate,
});
