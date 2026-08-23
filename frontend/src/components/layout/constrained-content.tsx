import type { JSX, ReactNode } from 'react';

/**
 * Left-aligned admin main column. Headings, tables, and forms share this width.
 * max-w-4xl (56rem) is about 30% wider than the previous multi-field form cap.
 */
export function ConstrainedContent({ children }: { readonly children: ReactNode }): JSX.Element {
  return <div className="w-full max-w-4xl">{children}</div>;
}
