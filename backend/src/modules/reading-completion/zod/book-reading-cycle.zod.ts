import { z } from 'zod';

import { BaseZodSchema, ZodBoolean, ZodDateNullable, ZodNumber, ZodNumberNullable } from '@/common/base/base.zod';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingCompletionStatus } from '@/modules/reading-completion/enum/general.enum';

export type BookReadingCyclePageZodType = z.infer<typeof BookReadingCyclePageZodSchema>;

export const BookReadingCyclePageZodSchema = z.object({
  pageIndex: ZodNumber,
  activeDurationMs: ZodNumber,
});

export type BookReadingCycleZodType = z.infer<typeof BookReadingCycleZodSchema>;

export const BookReadingCycleZodSchema = BaseZodSchema.extend({
  userId: ZodNumber,
  bookId: ZodNumber,
  cycleNumber: ZodNumber,
  status: z.nativeEnum(ReadingCompletionStatus),
  layoutType: z.nativeEnum(BookLayoutType),
  lastPageRead: ZodNumberNullable,
  activeTimeMs: ZodNumber,
  qualifyingPageCount: ZodNumber,
  lastPageReached: ZodBoolean,
  completedAt: ZodDateNullable,
  pages: z.array(BookReadingCyclePageZodSchema).optional(),
});
