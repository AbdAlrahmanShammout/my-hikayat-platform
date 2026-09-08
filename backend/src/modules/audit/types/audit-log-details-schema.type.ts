import type { Prisma } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type AuditLogType = OptionalRelations<
  Prisma.AuditLogGetPayload<{ include: { actor: true } }>
>;
