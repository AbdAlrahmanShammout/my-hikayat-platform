import type { Prisma } from '@prisma/client';

export const subscriptionDetailsInclude = {
  plan: true,
} satisfies Prisma.SubscriptionInclude;
