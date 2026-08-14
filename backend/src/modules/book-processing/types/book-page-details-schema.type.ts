import type { BookPage } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type BookPageType = OptionalRelations<BookPage>;
