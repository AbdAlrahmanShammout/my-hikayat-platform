import { z } from 'zod';

import { BaseZodSchema, ZodNumber } from '@/common/base/base.zod';

export type OfflineDownloadZodType = z.infer<typeof OfflineDownloadZodSchema>;

export const OfflineDownloadZodSchema = BaseZodSchema.extend({
  userId: ZodNumber,
  bookId: ZodNumber,
});
