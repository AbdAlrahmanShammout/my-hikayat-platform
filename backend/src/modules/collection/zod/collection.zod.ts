import { z } from 'zod';

import { BaseZodSchema, ZodString } from '@/common/base/base.zod';
import { CollectionBookZodType } from '@/modules/collection/zod/collection-book.zod';

export type CollectionZodType = z.infer<typeof CollectionZodSchema>;

export const CollectionZodSchema = BaseZodSchema.extend({
  title: ZodString,
  items: (z.any().nullish() as z.ZodType<CollectionBookZodType[] | null | undefined>).optional(),
});
