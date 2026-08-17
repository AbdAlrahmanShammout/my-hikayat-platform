import { z } from 'zod';

import {
  BaseZodSchema,
  ZodDate,
  ZodDateNullable,
  ZodNumber,
  ZodString,
} from '@/common/base/base.zod';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';

export type AdminInvitationZodType = z.infer<typeof AdminInvitationZodSchema>;

export const AdminInvitationZodSchema = BaseZodSchema.extend({
  email: ZodString,
  tokenHash: ZodString,
  status: z.nativeEnum(AdminInvitationStatus),
  expiresAt: ZodDate,
  invitedByUserId: ZodNumber,
  acceptedAt: ZodDateNullable,
});
