import type { JSX } from 'react';

import { Badge } from '@/components/ui/badge';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';

type AdminBookStatusBadgeProps = {
  readonly value: string;
};

/**
 * Displays a publishing or processing status from the API.
 */
export function AdminBookStatusBadge({ value }: AdminBookStatusBadgeProps): JSX.Element {
  return (
    <Badge variant={resolveBadgeVariant(value)} className="whitespace-nowrap">
      {formatBookEnumLabel(value)}
    </Badge>
  );
}

function resolveBadgeVariant(value: string): 'default' | 'secondary' | 'outline' {
  if (value === 'approved' || value === 'ready') {
    return 'default';
  }
  if (value === 'rejected' || value === 'failed') {
    return 'outline';
  }
  return 'secondary';
}
