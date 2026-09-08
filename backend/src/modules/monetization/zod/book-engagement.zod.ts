import { z } from 'zod';

import { BaseZodSchema, ZodNumber } from '@/common/base/base.zod';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookZodType } from '@/modules/book/zod/book.zod';

export type BookEngagementZodType = z.infer<typeof BookEngagementZodSchema>;

export const BookEngagementZodSchema = BaseZodSchema.extend({
  revenuePeriodId: ZodNumber,
  bookId: ZodNumber,
  layoutType: z.nativeEnum(BookLayoutType),
  activeReadingMs: ZodNumber,
  activeSpreadMs: ZodNumber,
  visualSceneTimeMs: ZodNumber,
  categoryWeight: ZodNumber,
  weightedEngagement: ZodNumber,
  book: (z.any().nullish() as z.ZodType<BookZodType | null | undefined>).optional(),
});
