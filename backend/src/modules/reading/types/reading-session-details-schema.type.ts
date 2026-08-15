import type { ReadingSession } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type ReadingSessionType = OptionalRelations<ReadingSession>;
