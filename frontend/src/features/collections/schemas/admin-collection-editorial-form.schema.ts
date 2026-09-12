import { z } from 'zod';

export const adminCollectionEditorialFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string(),
  accentColor: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^#[0-9A-Fa-f]{6}$/.test(value),
      'Use a six-digit hex color such as #1A6B4A, or leave blank',
    ),
});

export type AdminCollectionEditorialFormValues = z.infer<typeof adminCollectionEditorialFormSchema>;
