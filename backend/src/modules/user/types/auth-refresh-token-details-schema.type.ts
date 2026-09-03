import type { AuthRefreshToken } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type AuthRefreshTokenType = OptionalRelations<AuthRefreshToken>;
