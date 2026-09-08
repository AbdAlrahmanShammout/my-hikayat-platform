import type { Prisma } from '@prisma/client';

export const bookEngagementDetailsInclude = {
  book: true,
} satisfies Prisma.BookEngagementInclude;
