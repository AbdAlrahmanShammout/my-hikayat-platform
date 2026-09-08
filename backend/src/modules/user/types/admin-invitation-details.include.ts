import type { Prisma } from '@prisma/client';

export const adminInvitationDetailsInclude = {
  invitedBy: true,
} satisfies Prisma.AdminInvitationInclude;
