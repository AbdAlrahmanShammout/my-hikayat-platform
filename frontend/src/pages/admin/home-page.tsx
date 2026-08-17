import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminBooksTotalCard } from '@/features/books/components/admin-books-total-card';
import { AdminRevenuePeriodsTotalCard } from '@/features/revenue/components/admin-revenue-periods-total-card';
import { AdminSubscriptionsTotalCard } from '@/features/subscriptions/components/admin-subscriptions-total-card';
import { AdminUsersTotalCard } from '@/features/users/components/admin-users-total-card';

/**
 * Admin home. KPI values are backend list `total` fields, not computed metrics.
 */
export function AdminHomePage(): JSX.Element {
  const shouldReduceMotion: boolean | null = useReducedMotion();
  return (
    <>
      <PageHeader
        title="Overview"
        description="Counts come from existing admin list totals. This screen does not invent analytics."
      />
      <motion.div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        initial={shouldReduceMotion === true ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion === true ? 0 : 0.2 }}
      >
        <AdminBooksTotalCard />
        <AdminUsersTotalCard />
        <AdminSubscriptionsTotalCard />
        <AdminRevenuePeriodsTotalCard />
      </motion.div>
    </>
  );
}
