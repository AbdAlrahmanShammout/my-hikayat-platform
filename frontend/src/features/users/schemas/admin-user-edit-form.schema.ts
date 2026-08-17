import { z } from 'zod';

import { USER_ROLES } from '@/types/user-role';

export const adminUserEditFormSchema = z.object({
  role: z.enum([USER_ROLES.READER, USER_ROLES.AUTHOR, USER_ROLES.ADMIN]),
  isPublisher: z.boolean(),
});

export type AdminUserEditFormValues = z.infer<typeof adminUserEditFormSchema>;
