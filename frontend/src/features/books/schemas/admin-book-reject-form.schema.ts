import { z } from 'zod';

export const adminBookRejectFormSchema = z.object({
  reason: z.string().trim().min(1, 'A rejection reason is required'),
});

export type AdminBookRejectFormValues = z.infer<typeof adminBookRejectFormSchema>;
