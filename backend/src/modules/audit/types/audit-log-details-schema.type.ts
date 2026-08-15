import type { AuditLog } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type AuditLogType = OptionalRelations<AuditLog>;
