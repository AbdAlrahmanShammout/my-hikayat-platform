import type { BookRevenue } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type BookRevenueType = OptionalRelations<BookRevenue>;
