import { z } from 'zod';

import { BaseZodSchema, ZodNumber, ZodString } from '@/common/base/base.zod';

export type BookChapterZodType = z.infer<typeof BookChapterZodSchema>;

export const BookChapterZodSchema = BaseZodSchema.extend({
  bookId: ZodNumber,
  spineIndex: ZodNumber,
  href: ZodString,
  manifestId: ZodString,
  title: ZodString,
  contentText: ZodString,
});
