import { z } from 'zod';

import { BaseZodSchema, ZodNumber, ZodNumberNullable } from '@/common/base/base.zod';

export type BookSpreadZodType = z.infer<typeof BookSpreadZodSchema>;

export const BookSpreadZodSchema = BaseZodSchema.extend({
  bookId: ZodNumber,
  spreadIndex: ZodNumber,
  leftPageId: ZodNumberNullable,
  rightPageId: ZodNumberNullable,
  centerPageId: ZodNumberNullable,
});
