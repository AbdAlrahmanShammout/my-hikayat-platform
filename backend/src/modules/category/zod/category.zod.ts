import { z } from 'zod';

import { BaseZodSchema, ZodNumber, ZodString } from '@/common/base/base.zod';

export type CategoryZodType = z.infer<typeof CategoryZodSchema>;

export const CategoryZodSchema = BaseZodSchema.extend({
  name: ZodString,
  slug: ZodString,
  categoryWeight: ZodNumber,
});
