import { z } from 'zod';

export const adminCategoryWeightFormSchema = z.object({
  categoryWeight: z
    .number({
      required_error: 'categoryWeight is required',
      invalid_type_error: 'categoryWeight must be a number',
    })
    .finite('categoryWeight must be a finite number')
    .positive('categoryWeight must be greater than 0'),
});

export type AdminCategoryWeightFormValues = z.infer<typeof adminCategoryWeightFormSchema>;
