import type { AdminRevenuePeriodDetailSearch } from '@/features/revenue/lib/parse-admin-revenue-period-detail-search';

/**
 * Serializes earnings/analytics tab state into URL search params.
 */
export function buildAdminRevenuePeriodDetailSearchParams(
  search: AdminRevenuePeriodDetailSearch,
): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.tab !== 'earnings') {
    params.set('tab', search.tab);
  }
  if (search.ownerId !== undefined) {
    params.set('ownerId', String(search.ownerId));
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
