import type { CollectionBook } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type CollectionBookType = OptionalRelations<CollectionBook>;
