import type { JSX } from 'react';
import { RouterProvider } from 'react-router';

import { AppProviders } from '@/app/app-providers';
import { appRouter } from '@/app/app-router';

export function App(): JSX.Element {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  );
}
