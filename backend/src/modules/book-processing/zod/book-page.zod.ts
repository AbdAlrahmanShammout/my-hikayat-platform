import { z } from 'zod';

import { BaseZodSchema, ZodNumber, ZodString } from '@/common/base/base.zod';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';

export type BookPageZodType = z.infer<typeof BookPageZodSchema>;

export const BookPageZodSchema = BaseZodSchema.extend({
  bookId: ZodNumber,
  spineIndex: ZodNumber,
  href: ZodString,
  manifestId: ZodString,
  title: ZodString,
  width: ZodNumber,
  height: ZodNumber,
  spreadRole: z.nativeEnum(BookPageSpreadRole),
});
