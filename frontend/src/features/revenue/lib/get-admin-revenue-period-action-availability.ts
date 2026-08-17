import type { components } from '@/generated/admin';

export type AdminRevenuePeriodActionAvailability = {
  readonly canClose: boolean;
  readonly canEditPlatformCut: boolean;
  readonly closeDisabledReason: string | null;
  readonly platformCutDisabledReason: string | null;
};

/**
 * UX hints from displayed status. Backend still enforces close and cut rules.
 */
export function getAdminRevenuePeriodActionAvailability(
  period: Pick<components['schemas']['RevenuePeriodResponse'], 'status'>,
): AdminRevenuePeriodActionAvailability {
  if (period.status === 'closed') {
    return {
      canClose: false,
      canEditPlatformCut: false,
      closeDisabledReason: 'This period is already closed.',
      platformCutDisabledReason: 'Platform cut cannot change after the period is closed.',
    };
  }
  return {
    canClose: true,
    canEditPlatformCut: true,
    closeDisabledReason: null,
    platformCutDisabledReason: null,
  };
}
