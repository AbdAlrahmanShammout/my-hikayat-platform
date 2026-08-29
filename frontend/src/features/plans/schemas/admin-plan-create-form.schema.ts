import { z } from 'zod';

export const adminPlanCreateFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  stripePriceId: z.string().trim().min(1, 'Stripe price id is required'),
});

export type AdminPlanCreateFormValues = z.infer<typeof adminPlanCreateFormSchema>;
