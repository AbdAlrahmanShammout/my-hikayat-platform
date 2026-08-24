import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

import { ApiError } from '@/api/api-error';

const AUTH_FIELD_PROPERTIES = ['email', 'password'] as const;

type AuthFieldProperty = (typeof AUTH_FIELD_PROPERTIES)[number];

/**
 * Maps NestJS validationErrorObjects onto form fields and sets a root fallback message.
 */
export function applyAuthFormApiError<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  fallbackMessage: string,
): void {
  if (error instanceof ApiError) {
    for (const item of error.validationErrorObjects) {
      if (!isAuthFieldProperty(item.property)) {
        continue;
      }
      const firstConstraint: string | undefined = Object.values(item.constraints)[0];
      if (firstConstraint !== undefined) {
        setError(item.property as Path<TFieldValues>, { message: firstConstraint });
      }
    }
    setError('root' as Path<TFieldValues>, { message: error.message || fallbackMessage });
    return;
  }
  if (error instanceof Error && error.message.trim() !== '') {
    setError('root' as Path<TFieldValues>, { message: error.message });
    return;
  }
  setError('root' as Path<TFieldValues>, { message: fallbackMessage });
}

function isAuthFieldProperty(property: string): property is AuthFieldProperty {
  return AUTH_FIELD_PROPERTIES.includes(property as AuthFieldProperty);
}
