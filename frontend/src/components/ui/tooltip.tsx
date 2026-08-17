import type { JSX, ReactNode } from 'react';

import { cn } from '@/lib/cn';

function TooltipProvider({ children }: { readonly children: ReactNode }): JSX.Element {
  return <>{children}</>;
}

function Tooltip({
  children,
  label,
  className,
}: {
  readonly children: ReactNode;
  readonly label: string;
  readonly className?: string;
}): JSX.Element {
  return (
    <span className={cn('inline-flex', className)} title={label}>
      {children}
    </span>
  );
}

export { Tooltip, TooltipProvider };
