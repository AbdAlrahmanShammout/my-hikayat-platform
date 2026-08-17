import { createContext, useContext, useState, type HTMLAttributes, type JSX, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/cn';

type DialogContextValue = {
  readonly isOpen: boolean;
  readonly setIsOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

type DialogProps = {
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly children: ReactNode;
};

function Dialog({ open, onOpenChange, children }: DialogProps): JSX.Element {
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(false);
  const isOpen: boolean = open ?? uncontrolledOpen;
  const setIsOpen = (nextOpen: boolean): void => {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };
  return <DialogContext.Provider value={{ isOpen, setIsOpen }}>{children}</DialogContext.Provider>;
}

function DialogTrigger({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element {
  const dialog = useDialogContext();
  return (
    <button type="button" className={className} onClick={() => dialog.setIsOpen(true)}>
      {children}
    </button>
  );
}

function DialogContent({ className, children }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  const dialog = useDialogContext();
  const shouldReduceMotion: boolean | null = useReducedMotion();
  const duration: number = shouldReduceMotion === true ? 0 : 0.2;
  return (
    <AnimatePresence>
      {dialog.isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            onClick={() => {
              dialog.setIsOpen(false);
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn('relative z-10 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg', className)}
            initial={shouldReduceMotion === true ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration }}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('mb-4 flex flex-col gap-1', className)} {...props} />;
}

function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}

function DialogDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>): JSX.Element {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function useDialogContext(): DialogContextValue {
  const value = useContext(DialogContext);
  if (value === null) {
    throw new Error('Dialog components must be used within Dialog');
  }
  return value;
}

export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger };
