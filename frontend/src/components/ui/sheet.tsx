import { createContext, useContext, useState, type HTMLAttributes, type JSX, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/cn';

type SheetContextValue = {
  readonly isOpen: boolean;
  readonly setIsOpen: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

type SheetProps = {
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly children: ReactNode;
};

function Sheet({ open, onOpenChange, children }: SheetProps): JSX.Element {
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(false);
  const isOpen: boolean = open ?? uncontrolledOpen;
  const setIsOpen = (nextOpen: boolean): void => {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };
  return <SheetContext.Provider value={{ isOpen, setIsOpen }}>{children}</SheetContext.Provider>;
}

function SheetTrigger({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element {
  const sheet = useSheetContext();
  return (
    <button type="button" className={className} onClick={() => sheet.setIsOpen(true)}>
      {children}
    </button>
  );
}

function SheetContent({ className, children }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  const sheet = useSheetContext();
  const shouldReduceMotion: boolean | null = useReducedMotion();
  const duration: number = shouldReduceMotion === true ? 0 : 0.2;
  return (
    <AnimatePresence>
      {sheet.isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close panel"
            className="fixed inset-0 z-40 bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            onClick={() => {
              sheet.setIsOpen(false);
            }}
          />
          <motion.aside
            className={cn(
              'fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-background p-6 shadow-lg',
              className,
            )}
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration }}
          >
            {children}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('mb-4 flex flex-col gap-1', className)} {...props} />;
}

function SheetTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}

function useSheetContext(): SheetContextValue {
  const value = useContext(SheetContext);
  if (value === null) {
    throw new Error('Sheet components must be used within Sheet');
  }
  return value;
}

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger };
