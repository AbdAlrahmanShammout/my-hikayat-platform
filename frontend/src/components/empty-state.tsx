import type { JSX, ReactNode } from 'react';

type EmptyStateProps = {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
};

/**
 * Explains an empty collection. This is not an error.
 */
export function EmptyState({ title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-border bg-card p-8">
      <h2 className="text-base font-medium">{title}</h2>
      <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
