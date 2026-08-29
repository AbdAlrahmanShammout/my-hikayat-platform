import type { components } from '@/generated/admin';

export type AdminPlanCreateFormValues = {
  readonly name: string;
  readonly description: string;
  readonly stripePriceId: string;
};

/**
 * Maps the create form to POST /admin/plans for a paid Stripe plan.
 */
export function buildCreateAdminPlanBody(
  values: AdminPlanCreateFormValues,
): components['schemas']['CreatePlanRequestDto'] {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    kind: 'monthly_paid',
    stripePriceId: values.stripePriceId.trim(),
  };
}
