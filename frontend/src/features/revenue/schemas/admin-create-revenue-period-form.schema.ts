import { z } from 'zod';

import { isValidInstantString } from '@/features/revenue/lib/is-valid-instant-string';

const optionalPlatformCutPercentSchema = z.union([
  z.literal(''),
  z.coerce
    .number({ invalid_type_error: 'platformCutPercent must be a number' })
    .min(0, 'platformCutPercent must be from 0 through 100')
    .max(100, 'platformCutPercent must be from 0 through 100'),
]);

const optionalPoolAmountCentsSchema = z.union([
  z.literal(''),
  z.coerce
    .number({ invalid_type_error: 'poolAmountCents must be an integer number of cents' })
    .int('poolAmountCents must be an integer number of cents')
    .min(0, 'poolAmountCents must be a non-negative integer'),
]);

export const adminCreateRevenuePeriodFormSchema = z
  .object({
    startsAt: z
      .string()
      .trim()
      .min(1, 'startsAt is required')
      .refine(isValidInstantString, 'startsAt must be a valid instant'),
    endsAt: z
      .string()
      .trim()
      .min(1, 'endsAt is required')
      .refine(isValidInstantString, 'endsAt must be a valid instant'),
    platformCutPercent: optionalPlatformCutPercentSchema,
    poolAmountCents: optionalPoolAmountCentsSchema,
  })
  .superRefine((values, context) => {
    if (!isValidInstantString(values.startsAt) || !isValidInstantString(values.endsAt)) {
      return;
    }
    if (new Date(values.endsAt).getTime() <= new Date(values.startsAt).getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'endsAt must be later than startsAt',
      });
    }
  });

export type AdminCreateRevenuePeriodFormValues = z.infer<typeof adminCreateRevenuePeriodFormSchema>;
