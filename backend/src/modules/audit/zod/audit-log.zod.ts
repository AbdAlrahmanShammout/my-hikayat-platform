import { z } from 'zod';

import {
  BaseZodSchema,
  ZodNumber,
  ZodStringNullable,
  ZodJsonNullable,
} from '@/common/base/base.zod';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';

export type AuditLogZodType = z.infer<typeof AuditLogZodSchema>;

export const AuditLogZodSchema = BaseZodSchema.extend({
  actorUserId: ZodNumber,
  action: z.nativeEnum(AuditAction),
  subjectType: z.nativeEnum(AuditSubjectType),
  subjectId: ZodNumber,
  reason: ZodStringNullable,
  metadata: ZodJsonNullable,
});
