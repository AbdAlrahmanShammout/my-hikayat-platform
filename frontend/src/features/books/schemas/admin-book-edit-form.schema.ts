import { z } from 'zod';

export const adminBookEditFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  bookType: z.enum(['standard_chapter', 'picture_book', 'illustrated_chapter']),
  categoryIds: z.array(z.number().int().positive()),
});

export type AdminBookEditFormValues = z.infer<typeof adminBookEditFormSchema>;
