import { formatReadingStatusLabel } from '@/features/reading-completion/lib/format-reading-status-label';

describe('formatReadingStatusLabel', () => {
  it('labels a completed book in Arabic and English', () => {
    expect(formatReadingStatusLabel('completed')).toBe('مكتمل · Completed');
  });

  it('labels an in-progress book in Arabic and English', () => {
    expect(formatReadingStatusLabel('in_progress')).toBe('قيد القراءة · In progress');
  });

  it('returns nothing when the book was never opened', () => {
    expect(formatReadingStatusLabel(undefined)).toBeNull();
  });
});
