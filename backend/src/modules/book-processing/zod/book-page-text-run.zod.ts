import { z } from 'zod';

import { BaseZodSchema, ZodNumber, ZodNumberNullable, ZodString } from '@/common/base/base.zod';

export type BookPageTextRunZodType = z.infer<typeof BookPageTextRunZodSchema>;

export const BookPageTextRunZodSchema = BaseZodSchema.extend({
  textLayerId: ZodNumber,
  sortOrder: ZodNumber,
  text: ZodString,
  x: ZodNumber,
  y: ZodNumber,
  width: ZodNumberNullable,
  height: ZodNumberNullable,
});
