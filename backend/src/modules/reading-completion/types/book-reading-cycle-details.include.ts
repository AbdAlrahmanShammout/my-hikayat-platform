import { Prisma } from '@prisma/client';

export const bookReadingCycleDetailsInclude = {
  pages: { where: { deletedAt: null } },
} satisfies Prisma.BookReadingCycleInclude;
