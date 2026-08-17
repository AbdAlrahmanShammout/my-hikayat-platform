import { z } from 'zod';

export const adminCategoryCreateFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string(),
  categoryWeight: z
    .number({ invalid_type_error: 'categoryWeight must be a number' })
    .finite('categoryWeight must be a finite number')
    .positive('categoryWeight must be greater than 0')
    .optional(),
});

export type AdminCategoryCreateFormValues = z.infer<typeof adminCategoryCreateFormSchema>;
