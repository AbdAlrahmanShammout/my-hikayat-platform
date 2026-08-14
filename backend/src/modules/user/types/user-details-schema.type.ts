import type { User } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type UserType = OptionalRelations<User>;
