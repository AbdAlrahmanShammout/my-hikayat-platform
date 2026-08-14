import type { Prisma } from '@prisma/client';

export const bookDetailsInclude = {
  categories: true,
} satisfies Prisma.BookInclude;
