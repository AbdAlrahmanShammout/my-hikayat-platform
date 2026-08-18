import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminDashboardSummaryCards } from '@/features/dashboard/components/admin-dashboard-summary-cards';

/**
 * Admin home. KPI values come from GET /admin/dashboard/summary.
 */
export function AdminHomePage(): JSX.Element {
  const shouldReduceMotion: boolean | null = useReducedMotion();
  return (
    <>
      <PageHeader
        title="Overview"
        description="Platform totals come from the admin dashboard summary. This screen does not invent analytics."
      />
      <motion.div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        initial={shouldReduceMotion === true ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion === true ? 0 : 0.2 }}
      >
        <AdminDashboardSummaryCards />
      </motion.div>
    </>
  );
}
