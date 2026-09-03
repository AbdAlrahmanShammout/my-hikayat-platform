import { z } from 'zod';

import {
  BaseZodSchema,
  ZodDate,
  ZodDateNullable,
  ZodNumber,
  ZodString,
} from '@/common/base/base.zod';

export type AuthRefreshTokenZodType = z.infer<typeof AuthRefreshTokenZodSchema>;

export const AuthRefreshTokenZodSchema = BaseZodSchema.extend({
  userId: ZodNumber,
  tokenHash: ZodString,
  expiresAt: ZodDate,
  revokedAt: ZodDateNullable,
});
