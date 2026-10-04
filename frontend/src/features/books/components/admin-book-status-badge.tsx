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
    <Badge
      variant="outline"
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${resolveStatusClass(value)}`}
    >
      {formatBookEnumLabel(value)}
    </Badge>
  );
}

const STATUS_CLASS: Record<string, string> = {
  approved: 'border-transparent bg-[#e6f5ee] text-[#155c3f]',
  ready: 'border-transparent bg-[#e6f5ee] text-[#155c3f]',
  in_review: 'border-transparent bg-[#fef4e0] text-[#7a4e00]',
  pending: 'border-transparent bg-[#f0f4f2] text-[#4e6862]',
  not_started: 'border-transparent bg-[#f0f4f2] text-[#4e6862]',
  rejected: 'border-transparent bg-[#fdeaea] text-[#8b2020]',
  failed: 'border-transparent bg-[#fdeaea] text-[#8b2020]',
  processing: 'border-transparent bg-[#e1eff0] text-[#124f56]',
};

function resolveStatusClass(value: string): string {
  return STATUS_CLASS[value] ?? 'border-transparent bg-[#f0f4f2] text-[#4e6862]';
}
