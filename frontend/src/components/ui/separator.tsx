import type { HTMLAttributes, JSX } from 'react';

import { cn } from '@/lib/cn';

type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  readonly orientation?: 'horizontal' | 'vertical';
};

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps): JSX.Element {
  return (
    <div
      role="separator"
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
