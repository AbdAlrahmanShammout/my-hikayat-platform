import type { Prisma } from '@prisma/client';

export const bookRevenueDetailsInclude = {
  book: true,
  owner: true,
} satisfies Prisma.BookRevenueInclude;
