import { z } from 'zod';

import { BaseZodSchema, ZodNumber } from '@/common/base/base.zod';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

export type ReadingVisualEngagementZodType = z.infer<typeof ReadingVisualEngagementZodSchema>;

export const ReadingVisualEngagementZodSchema = BaseZodSchema.extend({
  userId: ZodNumber,
  bookId: ZodNumber,
  sessionId: ZodNumber,
  layoutType: z.nativeEnum(BookLayoutType),
  spreadIndex: ZodNumber,
  pageNumber: ZodNumber,
  activeDurationMs: ZodNumber,
  visualSceneTimeMs: ZodNumber,
});
