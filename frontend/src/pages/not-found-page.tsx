import type { JSX } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

/**
 * Unknown dashboard path.
 */
export function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex max-w-md flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">That URL is not part of the admin dashboard.</p>
        <Button asChild>
          <Link to="/admin">Go to admin home</Link>
        </Button>
      </div>
    </div>
  );
}
