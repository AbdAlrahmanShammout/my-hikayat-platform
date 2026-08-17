import { createContext, useContext, useState, type HTMLAttributes, type JSX, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

type TabsContextValue = {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

type TabsProps = {
  readonly value?: string;
  readonly defaultValue: string;
  readonly onValueChange?: (value: string) => void;
  readonly children: ReactNode;
  readonly className?: string;
};

function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}: TabsProps): JSX.Element {
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue);
  const currentValue: string = value ?? uncontrolledValue;
  const handleValueChange = (nextValue: string): void => {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }
    onValueChange?.(nextValue);
  };
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      role="tablist"
      className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1', className)}
      {...props}
    />
  );
}

type TabsTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  readonly value: string;
};

function TabsTrigger({ className, value, ...props }: TabsTriggerProps): JSX.Element {
  const tabs = useTabsContext();
  const isActive: boolean = tabs.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={cn(
        'inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium',
        isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
        className,
      )}
      onClick={() => {
        tabs.onValueChange(value);
      }}
      {...props}
    />
  );
}

type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  readonly value: string;
};

function TabsContent({ className, value, ...props }: TabsContentProps): JSX.Element | null {
  const tabs = useTabsContext();
  if (tabs.value !== value) {
    return null;
  }
  return <div role="tabpanel" className={cn('mt-4', className)} {...props} />;
}

function useTabsContext(): TabsContextValue {
  const value = useContext(TabsContext);
  if (value === null) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return value;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
