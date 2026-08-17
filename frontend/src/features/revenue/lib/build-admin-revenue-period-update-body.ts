import { parseWireCents } from '@/features/revenue/lib/parse-wire-cents';
import type { AdminUpdateRevenuePeriodFormValues } from '@/features/revenue/schemas/admin-update-revenue-period-form.schema';
import type { components } from '@/generated/admin';

/**
 * Builds a PATCH body with only changed pool/cut fields. Returns null when nothing changed.
 */
export function buildAdminRevenuePeriodUpdateBody(input: {
  readonly period: components['schemas']['RevenuePeriodResponse'];
  readonly values: AdminUpdateRevenuePeriodFormValues;
}): components['schemas']['UpdateRevenuePeriodRequestDto'] | null {
  const body: components['schemas']['UpdateRevenuePeriodRequestDto'] = {};
  const canEditCut: boolean = input.period.status === 'open';
  if (canEditCut && input.values.platformCutPercent !== input.period.platformCutPercent) {
    body.platformCutPercent = input.values.platformCutPercent;
  }
  const currentPoolCents: number | null = parseWireCents(input.period.poolAmountCents);
  if (
    input.values.poolAmountCents !== undefined &&
    input.values.poolAmountCents !== currentPoolCents
  ) {
    body.poolAmountCents = input.values.poolAmountCents;
  }
  if (body.platformCutPercent === undefined && body.poolAmountCents === undefined) {
    return null;
  }
  return body;
}
