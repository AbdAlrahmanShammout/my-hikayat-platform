import type { BookAsset } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type BookAssetType = OptionalRelations<BookAsset>;
