import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';
import { parsePositiveInt } from '@/lib/parse-positive-int';
import {
  SUBSCRIPTION_STATUS_FILTERS,
  type SubscriptionStatusFilter,
} from '@/features/subscriptions/lib/subscription-status-filters';

export type AdminSubscriptionsListSearch = {
  readonly status: SubscriptionStatusFilter | undefined;
  readonly userId: number | undefined;
  readonly offset: number;
};

/**
 * Reads list filters from the URL. Unknown status or userId values are ignored.
 */
export function parseAdminSubscriptionsListSearch(
  searchParams: URLSearchParams,
): AdminSubscriptionsListSearch {
  return {
    status: parseStatusFilter(searchParams.get('status') ?? undefined),
    userId: parsePositiveInt(searchParams.get('userId') ?? undefined) ?? undefined,
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}

function parseStatusFilter(value: string | undefined): SubscriptionStatusFilter | undefined {
  if (value === undefined) {
    return undefined;
  }
  return SUBSCRIPTION_STATUS_FILTERS.find((status) => status === value);
}
