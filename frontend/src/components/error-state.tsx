import type { JSX } from 'react';

import { Button } from '@/components/ui/button';

type ErrorStateProps = {
  readonly title?: string;
  readonly message: string;
  readonly onRetry?: () => void;
};

/**
 * Visible failure state for an async screen.
 */
export function ErrorState({
  title = 'Unable to load this page',
  message,
  onRetry,
}: ErrorStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-8">
      <div className="space-y-1">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="max-w-xl text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry !== undefined ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
