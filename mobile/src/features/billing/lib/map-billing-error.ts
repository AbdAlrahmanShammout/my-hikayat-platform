import { ApiError } from '@/api/api-error';

/**
 * Maps billing/trial API failures to kids-friendly copy.
 * Does not invent eligibility rules.
 */
export function mapBillingError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'TRIAL_ALREADY_USED' || error.code === 'TRIAL_NOT_NEEDED') {
      return error.message.trim().length > 0
        ? error.message
        : 'This free trial is not available for your account.';
    }
    if (error.statusCode === 404) {
      return 'No subscription is set up yet. Ask a grown-up to subscribe.';
    }
    if (error.message.trim().length > 0) {
      return error.message;
    }
  }
  return 'Could not talk to billing right now.';
}
