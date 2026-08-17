import { z } from 'zod';

export const adminInvitationCreateFormSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
});

export type AdminInvitationCreateFormValues = z.infer<typeof adminInvitationCreateFormSchema>;
