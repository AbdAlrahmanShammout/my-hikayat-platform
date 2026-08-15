import type { RevenuePeriod } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type RevenuePeriodType = OptionalRelations<RevenuePeriod>;
