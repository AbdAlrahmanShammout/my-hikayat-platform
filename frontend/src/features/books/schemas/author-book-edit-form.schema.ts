import { z } from 'zod';

import { BOOK_TYPE_OPTIONS } from '@/features/books/lib/book-type-options';

export const authorBookEditFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  bookType: z.enum(BOOK_TYPE_OPTIONS),
  categoryIds: z.array(z.number().int().positive()),
});

export type AuthorBookEditFormValues = z.infer<typeof authorBookEditFormSchema>;
