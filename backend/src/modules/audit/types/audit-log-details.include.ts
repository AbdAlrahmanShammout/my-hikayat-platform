import type { Prisma } from '@prisma/client';

export const auditLogDetailsInclude = {
  actor: true,
} satisfies Prisma.AuditLogInclude;
