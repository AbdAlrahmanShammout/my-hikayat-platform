import { z } from 'zod';

import { BaseZodSchema, ZodNumber } from '@/common/base/base.zod';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

export type ReadingChapterEngagementZodType = z.infer<typeof ReadingChapterEngagementZodSchema>;

export const ReadingChapterEngagementZodSchema = BaseZodSchema.extend({
  userId: ZodNumber,
  bookId: ZodNumber,
  sessionId: ZodNumber,
  layoutType: z.nativeEnum(BookLayoutType),
  spineIndex: ZodNumber,
  activeDurationMs: ZodNumber,
});
