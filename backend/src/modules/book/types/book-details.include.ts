import type { Prisma } from '@prisma/client';

export const bookDetailsInclude = {
  categories: true,
  owner: true,
  sourceMetadata: true,
} satisfies Prisma.BookInclude;
