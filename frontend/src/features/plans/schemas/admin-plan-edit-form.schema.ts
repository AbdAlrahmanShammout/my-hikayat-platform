import { z } from 'zod';

export const adminPlanEditFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  stripePriceId: z.string(),
});

export type AdminPlanEditFormValues = z.infer<typeof adminPlanEditFormSchema>;
