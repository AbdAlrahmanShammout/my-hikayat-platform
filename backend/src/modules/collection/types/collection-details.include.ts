import type { Prisma } from '@prisma/client';

export const collectionDetailsInclude = {
  items: {
    orderBy: [{ displayOrder: 'asc' as const }, { id: 'asc' as const }],
  },
} satisfies Prisma.CollectionInclude;
