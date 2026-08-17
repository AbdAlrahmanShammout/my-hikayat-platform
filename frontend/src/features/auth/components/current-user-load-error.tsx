import type { JSX } from 'react';
import { Navigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { ErrorState } from '@/components/error-state';

type CurrentUserLoadErrorProps = {
  readonly error: Error;
  readonly onRetry: () => void;
};

/**
 * Shared GET /auth/me failure for audience route guards.
 */
export function CurrentUserLoadError({ error, onRetry }: CurrentUserLoadErrorProps): JSX.Element {
  if (error instanceof ApiError && error.isUnauthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <ErrorState message={getUserFacingErrorMessage(error)} onRetry={onRetry} />
    </div>
  );
}
