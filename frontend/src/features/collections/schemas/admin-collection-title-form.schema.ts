import { z } from 'zod';

export const adminCollectionTitleFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
});

export type AdminCollectionTitleFormValues = z.infer<typeof adminCollectionTitleFormSchema>;
