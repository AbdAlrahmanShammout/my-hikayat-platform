import { buildCalendarMonthBounds } from '@/features/revenue/lib/build-calendar-month-bounds';
import type { AdminCreateRevenuePeriodFormValues } from '@/features/revenue/schemas/admin-create-revenue-period-form.schema';
import type { components } from '@/generated/admin';

/**
 * Maps the chosen calendar month onto POST /admin/revenue-periods.
 */
export function buildCreateAdminRevenuePeriodBody(
  values: AdminCreateRevenuePeriodFormValues,
): components['schemas']['CreateRevenuePeriodRequestDto'] {
  const bounds = buildCalendarMonthBounds(values.month);
  if (bounds === null) {
    throw new Error('month must be a calendar month');
  }
  return {
    startsAt: bounds.startsAt,
    endsAt: bounds.endsAt,
  };
}
