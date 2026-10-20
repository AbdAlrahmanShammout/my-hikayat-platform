import type { Prisma } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type BookReadingCycleType = OptionalRelations<
  Prisma.BookReadingCycleGetPayload<{ include: { pages: true } }>
>;
