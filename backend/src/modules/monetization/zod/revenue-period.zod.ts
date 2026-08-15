import { z } from 'zod';

import { BaseZodSchema, ZodDate, ZodNumber, ZodNumberNullable } from '@/common/base/base.zod';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';

export type RevenuePeriodZodType = z.infer<typeof RevenuePeriodZodSchema>;

export const RevenuePeriodZodSchema = BaseZodSchema.extend({
  startsAt: ZodDate,
  endsAt: ZodDate,
  status: z.nativeEnum(RevenuePeriodStatus),
  platformCutPercent: ZodNumber,
  poolAmountCents: ZodNumberNullable,
});
