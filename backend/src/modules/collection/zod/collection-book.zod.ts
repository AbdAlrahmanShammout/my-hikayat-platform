import { z } from 'zod';

import { BaseZodSchema, ZodNumber } from '@/common/base/base.zod';

export type CollectionBookZodType = z.infer<typeof CollectionBookZodSchema>;

export const CollectionBookZodSchema = BaseZodSchema.extend({
  collectionId: ZodNumber,
  bookId: ZodNumber,
  displayOrder: ZodNumber,
});
