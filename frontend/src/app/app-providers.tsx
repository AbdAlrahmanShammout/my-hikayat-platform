import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { JSX, ReactNode } from 'react';
import { useState } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { createAppQueryClient } from '@/config/query-client';

type AppProvidersProps = {
  readonly children: ReactNode;
};

/**
 * Application-wide providers. QueryClient is created once per mount.
 */
export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  const [queryClient] = useState<QueryClient>(createAppQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}
