import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type JSX,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/cn';

type DialogContextValue = {
  readonly isOpen: boolean;
  readonly setIsOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);
const DialogTitleContext = createContext<string | null>(null);

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

const DIALOG_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function DialogContent({ className, children }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  const dialog = useDialogContext();
  const titleId: string = useId();
  const shouldReduceMotion: boolean | null = useReducedMotion();
  const duration: number = shouldReduceMotion === true ? 0 : 0.2;
  return (
    <DialogTitleContext.Provider value={titleId}>
      <AnimatePresence>
        {dialog.isOpen ? (
          <DialogSurface
            className={className}
            duration={duration}
            shouldReduceMotion={shouldReduceMotion === true}
            titleId={titleId}
            onClose={() => {
              dialog.setIsOpen(false);
            }}
          >
            {children}
          </DialogSurface>
        ) : null}
      </AnimatePresence>
    </DialogTitleContext.Provider>
  );
}

function DialogSurface({
  className,
  children,
  duration,
  shouldReduceMotion,
  titleId,
  onClose,
}: {
  readonly className?: string;
  readonly children: ReactNode;
  readonly duration: number;
  readonly shouldReduceMotion: boolean;
  readonly titleId: string;
  readonly onClose: () => void;
}): JSX.Element {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const previouslyFocused: HTMLElement | null =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel: HTMLElement | null = document.getElementById(titleId)?.closest('[role="dialog"]') ?? null;
    const focusDialog = (): void => {
      const firstFocusable: HTMLElement | null =
        panel?.querySelector<HTMLElement>(DIALOG_FOCUSABLE_SELECTOR) ?? null;
      (firstFocusable ?? panel)?.focus();
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || panel === null) {
        return;
      }
      const focusable: HTMLElement[] = Array.from(
        panel.querySelectorAll<HTMLElement>(DIALOG_FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first: HTMLElement = focusable[0];
      const last: HTMLElement = focusable[focusable.length - 1];
      const active: Element | null = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    focusDialog();
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [titleId]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-foreground/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg outline-none',
          className,
        )}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('mb-4 flex flex-col gap-1', className)} {...props} />;
}

function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  const titleId: string | null = useContext(DialogTitleContext);
  return <h2 id={titleId ?? undefined} className={cn('text-lg font-semibold', className)} {...props} />;
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
