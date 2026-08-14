import type { BookSpread } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type BookSpreadType = OptionalRelations<BookSpread>;
