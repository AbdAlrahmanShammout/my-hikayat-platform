import { z } from 'zod';

import {
  BaseZodSchema,
  ZodDate,
  ZodDateNullable,
  ZodNumber,
  ZodNumberNullable,
  ZodString,
  ZodStringNullable,
} from '@/common/base/base.zod';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { UserZodType } from '@/modules/user/zod/user.zod';

export type AdminInvitationZodType = z.infer<typeof AdminInvitationZodSchema>;

export const AdminInvitationZodSchema = BaseZodSchema.extend({
  email: ZodString,
  tokenHash: ZodString,
  status: z.nativeEnum(AdminInvitationStatus),
  expiresAt: ZodDate,
  invitedByUserId: ZodNumber,
  acceptedAt: ZodDateNullable,
  lastSentAt: ZodDateNullable,
  resendCount: ZodNumber,
  revokedAt: ZodDateNullable,
  revokedByUserId: ZodNumberNullable,
  revokeReason: ZodStringNullable,
  invitedBy: (z.any().nullish() as z.ZodType<UserZodType | null | undefined>).optional(),
});
