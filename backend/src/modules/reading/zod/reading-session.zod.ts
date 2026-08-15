import { z } from 'zod';

import {
  BaseZodSchema,
  ZodDate,
  ZodDateNullable,
  ZodNumber,
  ZodNumberNullable,
} from '@/common/base/base.zod';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

export type ReadingSessionZodType = z.infer<typeof ReadingSessionZodSchema>;

export const ReadingSessionZodSchema = BaseZodSchema.extend({
  userId: ZodNumber,
  bookId: ZodNumber,
  layoutType: z.nativeEnum(BookLayoutType),
  startedAt: ZodDate,
  endedAt: ZodDateNullable,
  activeDurationMs: ZodNumber,
  idleDurationMs: ZodNumber,
  spineIndex: ZodNumberNullable,
  scrollOffset: ZodNumberNullable,
  spreadIndex: ZodNumberNullable,
  pageNumber: ZodNumberNullable,
});
