import type { BookEngagement } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type BookEngagementType = OptionalRelations<BookEngagement>;
