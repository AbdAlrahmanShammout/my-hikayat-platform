import type { Prisma } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type BookRevenueType = OptionalRelations<
  Prisma.BookRevenueGetPayload<{ include: { book: true; owner: true } }>
>;
