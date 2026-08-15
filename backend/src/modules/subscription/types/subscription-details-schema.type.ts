import type { Prisma } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type SubscriptionDetailsType = OptionalRelations<
  Prisma.SubscriptionGetPayload<{ include: { plan: true } }>
>;
