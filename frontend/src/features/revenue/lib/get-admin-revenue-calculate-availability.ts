import { parseWireCents } from '@/features/revenue/lib/parse-wire-cents';
import type { components } from '@/generated/admin';

export type AdminRevenueCalculateAvailability = {
  readonly canCalculate: boolean;
  readonly calculateDisabledReason: string | null;
};

/**
 * UX hint from displayed pool. Backend still requires poolAmountCents to calculate.
 */
export function getAdminRevenueCalculateAvailability(
  period: Pick<components['schemas']['RevenuePeriodResponse'], 'poolAmountCents'>,
): AdminRevenueCalculateAvailability {
  if (parseWireCents(period.poolAmountCents) === null) {
    return {
      canCalculate: false,
      calculateDisabledReason: 'Set poolAmountCents before calculating author shares.',
    };
  }
  return {
    canCalculate: true,
    calculateDisabledReason: null,
  };
}
