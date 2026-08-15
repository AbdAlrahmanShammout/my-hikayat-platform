import { z } from 'zod';

import { BaseZodSchema, ZodNumber } from '@/common/base/base.zod';

export type BookRevenueZodType = z.infer<typeof BookRevenueZodSchema>;

export const BookRevenueZodSchema = BaseZodSchema.extend({
  revenuePeriodId: ZodNumber,
  bookId: ZodNumber,
  ownerId: ZodNumber,
  weightedEngagement: ZodNumber,
  poolShareCents: ZodNumber,
  platformCutCents: ZodNumber,
  authorCents: ZodNumber,
});
