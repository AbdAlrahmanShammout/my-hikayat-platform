import type { FieldPath, UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';

/**
 * Maps API validationErrorObjects onto matching form fields, then sets the root message.
 */
export function applyAdminFormApiError<TFieldValues extends Record<string, unknown>>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  fieldNames: ReadonlyArray<FieldPath<TFieldValues>>,
): void {
  if (error instanceof ApiError) {
    const allowedNames = new Set<string>(fieldNames);
    for (const item of error.validationErrorObjects) {
      if (!allowedNames.has(item.property)) {
        continue;
      }
      const firstConstraint: string | undefined = Object.values(item.constraints)[0];
      if (firstConstraint !== undefined) {
        setError(item.property as FieldPath<TFieldValues>, { message: firstConstraint });
      }
    }
  }
  setError('root', { message: getUserFacingErrorMessage(error) });
}
