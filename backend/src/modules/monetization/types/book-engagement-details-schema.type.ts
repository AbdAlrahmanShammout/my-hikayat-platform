import type { Prisma } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type BookEngagementType = OptionalRelations<
  Prisma.BookEngagementGetPayload<{ include: { book: true } }>
>;
