import { ApiError } from '@/api/api-error';

const GENERIC_FAILURE_MESSAGE = 'Something went wrong. Try again.';

/**
 * Returns a safe UI message. Never surfaces stack traces or unexpected 5xx bodies.
 */
export function getUserFacingErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return GENERIC_FAILURE_MESSAGE;
  }
  if (error.statusCode >= 500) {
    return GENERIC_FAILURE_MESSAGE;
  }
  return error.message;
}
