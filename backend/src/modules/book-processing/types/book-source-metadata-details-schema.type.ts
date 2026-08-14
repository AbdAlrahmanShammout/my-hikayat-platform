import type { BookSourceMetadata } from '@prisma/client';

import { OptionalRelations } from '@/common/base/base.entity';

export type BookSourceMetadataType = OptionalRelations<BookSourceMetadata>;
