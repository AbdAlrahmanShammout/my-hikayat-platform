import type { HTMLAttributes, JSX } from 'react';

import { cn } from '@/lib/cn';

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
