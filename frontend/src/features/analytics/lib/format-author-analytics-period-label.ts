import { formatRevenuePeriodStatus } from '@/features/analytics/lib/format-revenue-period-status';
import type { AuthorAnalyticsPeriodOption } from '@/features/analytics/lib/to-author-analytics-period-options';
import { formatWireInstant } from '@/lib/format-wire-instant';

/**
 * Labels a revenue period from GET /author/earnings/trend without showing authorCents.
 */
export function formatAuthorAnalyticsPeriodLabel(period: AuthorAnalyticsPeriodOption): string {
  if (period.startsAt === '' && period.endsAt === '') {
    return `Period #${String(period.revenuePeriodId)}`;
  }
  return `${formatWireInstant(period.startsAt)} – ${formatWireInstant(period.endsAt)} (${formatRevenuePeriodStatus(period.status)})`;
}
