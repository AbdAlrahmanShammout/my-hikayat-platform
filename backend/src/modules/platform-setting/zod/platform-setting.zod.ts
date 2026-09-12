import { z } from 'zod';

import { BaseZodSchema, ZodString, ZodStringNullable } from '@/common/base/base.zod';

export type PlatformSettingZodType = z.infer<typeof PlatformSettingZodSchema>;

export const PlatformSettingZodSchema = BaseZodSchema.extend({
  key: ZodString,
  value: ZodStringNullable,
});
