import type { Prisma } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type BookDetailsType = OptionalRelations<
  Prisma.BookGetPayload<{ include: { categories: true; owner: true } }>
>;
