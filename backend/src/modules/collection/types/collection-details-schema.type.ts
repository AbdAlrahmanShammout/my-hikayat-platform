import type { Prisma } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type CollectionDetailsType = OptionalRelations<
  Prisma.CollectionGetPayload<{ include: { items: true } }>
>;
