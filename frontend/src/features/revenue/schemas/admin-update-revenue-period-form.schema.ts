import { z } from 'zod';

export const adminUpdateRevenuePeriodFormSchema = z.object({
  platformCutPercent: z
    .number({
      required_error: 'platformCutPercent is required',
      invalid_type_error: 'platformCutPercent must be a number',
    })
    .min(0, 'platformCutPercent must be from 0 through 100')
    .max(100, 'platformCutPercent must be from 0 through 100'),
  poolAmountCents: z
    .number({ invalid_type_error: 'poolAmountCents must be an integer number of cents' })
    .int('poolAmountCents must be an integer number of cents')
    .min(0, 'poolAmountCents must be a non-negative integer')
    .optional(),
});

export type AdminUpdateRevenuePeriodFormValues = z.infer<typeof adminUpdateRevenuePeriodFormSchema>;
