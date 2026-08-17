import { z } from 'zod';

export const adminAddCollectionBookFormSchema = z.object({
  bookId: z.coerce.number().int().positive('Enter a positive book id'),
});

export type AdminAddCollectionBookFormValues = z.infer<typeof adminAddCollectionBookFormSchema>;
