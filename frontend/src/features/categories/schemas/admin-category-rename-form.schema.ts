import { z } from 'zod';

export const adminCategoryRenameFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string().trim().min(1, 'Slug is required'),
});

export type AdminCategoryRenameFormValues = z.infer<typeof adminCategoryRenameFormSchema>;
