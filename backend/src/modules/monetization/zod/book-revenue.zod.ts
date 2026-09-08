import { z } from 'zod';

import { BaseZodSchema, ZodNumber } from '@/common/base/base.zod';
import { BookZodType } from '@/modules/book/zod/book.zod';
import { UserZodType } from '@/modules/user/zod/user.zod';

export type BookRevenueZodType = z.infer<typeof BookRevenueZodSchema>;

export const BookRevenueZodSchema = BaseZodSchema.extend({
  revenuePeriodId: ZodNumber,
  bookId: ZodNumber,
  ownerId: ZodNumber,
  weightedEngagement: ZodNumber,
  poolShareCents: ZodNumber,
  platformCutCents: ZodNumber,
  authorCents: ZodNumber,
  book: (z.any().nullish() as z.ZodType<BookZodType | null | undefined>).optional(),
  owner: (z.any().nullish() as z.ZodType<UserZodType | null | undefined>).optional(),
});
