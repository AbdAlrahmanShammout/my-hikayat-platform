import type { AdminCreateRevenuePeriodFormValues } from '@/features/revenue/schemas/admin-create-revenue-period-form.schema';
import type { components } from '@/generated/admin';

/**
 * Omits empty optional cut and pool fields from POST /admin/revenue-periods.
 */
export function buildCreateAdminRevenuePeriodBody(
  values: AdminCreateRevenuePeriodFormValues,
): components['schemas']['CreateRevenuePeriodRequestDto'] {
  const body: components['schemas']['CreateRevenuePeriodRequestDto'] = {
    startsAt: values.startsAt,
    endsAt: values.endsAt,
  };
  if (values.platformCutPercent !== '') {
    body.platformCutPercent = values.platformCutPercent;
  }
  if (values.poolAmountCents !== '') {
    body.poolAmountCents = values.poolAmountCents;
  }
  return body;
}
