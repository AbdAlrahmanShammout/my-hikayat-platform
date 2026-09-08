import type { Prisma } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type AdminInvitationType = OptionalRelations<
  Prisma.AdminInvitationGetPayload<{ include: { invitedBy: true } }>
>;
