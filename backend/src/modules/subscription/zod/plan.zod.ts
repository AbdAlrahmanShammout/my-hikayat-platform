import { z } from 'zod';

import { BaseZodSchema, ZodString } from '@/common/base/base.zod';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

export type PlanZodType = z.infer<typeof PlanZodSchema>;

export const PlanZodSchema = BaseZodSchema.extend({
  slug: ZodString,
  name: ZodString,
  description: ZodString,
  kind: z.nativeEnum(PlanKind),
  interval: z.nativeEnum(PlanInterval).nullable(),
  stripePriceId: ZodString.nullable(),
  amountCents: z.number().int().nullable(),
  currency: ZodString.nullable(),
});
