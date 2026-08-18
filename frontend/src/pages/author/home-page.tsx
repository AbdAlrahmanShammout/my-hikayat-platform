import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AuthorSessionSummary } from '@/features/auth/components/author-session-summary';
import { AuthorDashboardSummaryCards } from '@/features/dashboard/components/author-dashboard-summary-cards';

/**
 * Author home. KPI values come from GET /author/dashboard/summary.
 */
export function AuthorHomePage(): JSX.Element {
  const shouldReduceMotion: boolean | null = useReducedMotion();
  return (
    <>
      <PageHeader
        title="Overview"
        description="Publishing totals come from the author dashboard summary. Identity remains secondary."
      />
      <motion.div
        className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        initial={shouldReduceMotion === true ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion === true ? 0 : 0.2 }}
      >
        <AuthorDashboardSummaryCards />
      </motion.div>
      <AuthorSessionSummary />
    </>
  );
}
