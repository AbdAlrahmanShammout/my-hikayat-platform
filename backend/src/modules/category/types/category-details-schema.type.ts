import type { Category } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type CategoryType = OptionalRelations<Category>;
