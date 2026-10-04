import type { JSX } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

type CopyTextButtonProps = {
  readonly value: string;
  readonly label: string;
};

/**
 * Copies a technical identifier and announces the result.
 */
export function CopyTextButton({ value, label }: CopyTextButtonProps): JSX.Element {
  const [status, setStatus] = useState<string>('');
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          void copyValue(value, setStatus);
        }}
      >
        {label}
      </Button>
      <span className="text-sm text-muted-foreground" role="status">
        {status}
      </span>
    </span>
  );
}

async function copyValue(value: string, setStatus: (status: string) => void): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    setStatus('Copied');
  } catch {
    setStatus('Copy failed');
  }
}
