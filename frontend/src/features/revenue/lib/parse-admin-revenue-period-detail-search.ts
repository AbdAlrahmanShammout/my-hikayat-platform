import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';
import { parsePositiveInt } from '@/lib/parse-positive-int';

export const ADMIN_REVENUE_PERIOD_TABS = ['earnings', 'analytics'] as const;

export type AdminRevenuePeriodTab = (typeof ADMIN_REVENUE_PERIOD_TABS)[number];

export type AdminRevenuePeriodDetailSearch = {
  readonly tab: AdminRevenuePeriodTab;
  readonly ownerId: number | undefined;
  readonly offset: number;
};

/**
 * Reads earnings/analytics tab, owner filter, and paging from the URL.
 */
export function parseAdminRevenuePeriodDetailSearch(
  searchParams: URLSearchParams,
): AdminRevenuePeriodDetailSearch {
  return {
    tab: parseTab(searchParams.get('tab') ?? undefined),
    ownerId: parsePositiveInt(searchParams.get('ownerId') ?? undefined) ?? undefined,
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}

function parseTab(value: string | undefined): AdminRevenuePeriodTab {
  return ADMIN_REVENUE_PERIOD_TABS.find((tab) => tab === value) ?? 'earnings';
}
