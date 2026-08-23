import { QueryClient } from '@tanstack/react-query';

/**
 * Creates the shared TanStack Query client for server state.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000,
      },
    },
  });
}
