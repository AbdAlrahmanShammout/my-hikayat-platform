import { z } from 'zod';

import { BaseZodSchema, ZodBoolean, ZodString } from '@/common/base/base.zod';
import { UserRole } from '@/modules/user/enum/general.enum';

export type UserZodType = z.infer<typeof UserZodSchema>;

export const UserZodSchema = BaseZodSchema.extend({
  email: ZodString,
  passwordHash: ZodString,
  role: z.nativeEnum(UserRole),
  isPublisher: ZodBoolean,
});
