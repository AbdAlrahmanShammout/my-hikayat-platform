import * as LabelPrimitive from '@radix-ui/react-label';
import type { ComponentPropsWithoutRef, JSX } from 'react';

import { cn } from '@/lib/cn';

type LabelProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

function Label({ className, ...props }: LabelProps): JSX.Element {
  return (
    <LabelPrimitive.Root
      className={cn('text-sm leading-none font-medium peer-disabled:opacity-70', className)}
      {...props}
    />
  );
}

export { Label };
