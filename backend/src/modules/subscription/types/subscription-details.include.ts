import type { Prisma } from '@prisma/client';

export const subscriptionDetailsInclude = {
  plan: true,
  user: true,
} satisfies Prisma.SubscriptionInclude;
