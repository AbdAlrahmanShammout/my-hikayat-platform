import { z } from 'zod';

import {
  BaseZodSchema,
  ZodDate,
  ZodDateNullable,
  ZodNumber,
  ZodStringNullable,
} from '@/common/base/base.zod';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { PlanZodType } from '@/modules/subscription/zod/plan.zod';

export type SubscriptionZodType = z.infer<typeof SubscriptionZodSchema>;

export const SubscriptionZodSchema = BaseZodSchema.extend({
  userId: ZodNumber,
  planId: ZodNumber,
  status: z.nativeEnum(SubscriptionStatus),
  startedAt: ZodDate,
  currentPeriodStart: ZodDateNullable,
  currentPeriodEnd: ZodDateNullable,
  canceledAt: ZodDateNullable,
  activatedAt: ZodDateNullable,
  trialStartedAt: ZodDateNullable,
  trialEndsAt: ZodDateNullable,
  stripeCustomerId: ZodStringNullable,
  stripeSubscriptionId: ZodStringNullable,
  plan: (z.any().nullish() as z.ZodType<PlanZodType | null | undefined>).optional(),
});
