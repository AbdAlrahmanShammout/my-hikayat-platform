import type { JSX, ReactNode } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type KpiCardProps = {
  readonly title: string;
  readonly description: string;
  readonly emptyLabel: string;
  readonly total: number | undefined;
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
  readonly formattedValue?: string;
  readonly action: ReactNode;
};

/**
 * KPI tile that displays a backend `total`. It does not compute business metrics.
 */
export function KpiCard({
  title,
  description,
  emptyLabel,
  total,
  isPending,
  isError,
  error,
  onRetry,
  formattedValue,
  action,
}: KpiCardProps): JSX.Element {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <KpiCardValue
          emptyLabel={emptyLabel}
          total={total}
          isPending={isPending}
          isError={isError}
          error={error}
          onRetry={onRetry}
          formattedValue={formattedValue}
        />
        {action}
      </CardContent>
    </Card>
  );
}

function KpiCardValue({
  emptyLabel,
  total,
  isPending,
  isError,
  error,
  onRetry,
  formattedValue,
}: Omit<KpiCardProps, 'title' | 'description' | 'action'>): JSX.Element {
  if (isPending) {
    return (
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading count</span>
        <Skeleton className="h-10 w-20" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-start gap-2">
        <Alert variant="destructive">
          <AlertDescription>{getUserFacingErrorMessage(error)}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }
  const displayTotal: number = total ?? 0;
  const displayValue: string = formattedValue ?? displayTotal.toLocaleString();
  return (
    <div>
      <p className="text-3xl font-semibold tracking-tight">{displayValue}</p>
      {displayTotal === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : null}
    </div>
  );
}
