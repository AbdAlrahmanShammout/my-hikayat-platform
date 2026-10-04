import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, JSX } from 'react';

import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        success: 'border-transparent bg-[#E6F5EE] text-[#155C3F]',
        warning: 'border-transparent bg-[#FEF4E0] text-[#7A4E00]',
        destructive: 'border-transparent bg-[#FDEAEA] text-[#8B2020]',
        info: 'border-transparent bg-[#E1EFF0] text-[#124F56]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
