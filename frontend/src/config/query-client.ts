import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/api-error';

const QUERY_STALE_TIME_MS = 30_000;

/**
 * Creates the dashboard QueryClient with retry rules that treat 401 as signed-out.
 */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: shouldRetryQuery,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && (error.isUnauthenticated || error.isAccessDenied)) {
    return false;
  }
  return failureCount < 1;
}
