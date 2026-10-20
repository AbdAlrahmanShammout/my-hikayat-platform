import type { ReadingCompletionStatus } from '@/features/reading-completion/api/list-reading-completions';

/**
 * Bilingual marker for a stored reading status. Unread books have no marker.
 */
export function formatReadingStatusLabel(
  status: ReadingCompletionStatus | undefined,
): string | null {
  if (status === 'completed') {
    return 'مكتمل · Completed';
  }
  if (status === 'in_progress') {
    return 'قيد القراءة · In progress';
  }
  return null;
}
