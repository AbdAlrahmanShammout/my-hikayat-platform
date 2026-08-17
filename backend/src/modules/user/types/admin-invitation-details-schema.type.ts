import type { AdminInvitation } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type AdminInvitationType = OptionalRelations<AdminInvitation>;
