import { z } from 'zod';

const CALENDAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const adminCreateRevenuePeriodFormSchema = z.object({
  month: z
    .string()
    .trim()
    .regex(CALENDAR_MONTH_PATTERN, 'month must be a calendar month'),
});

export type AdminCreateRevenuePeriodFormValues = z.infer<typeof adminCreateRevenuePeriodFormSchema>;
