import { z } from 'zod';

export const adminCollectionEditorialFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string(),
});

export type AdminCollectionEditorialFormValues = z.infer<typeof adminCollectionEditorialFormSchema>;
