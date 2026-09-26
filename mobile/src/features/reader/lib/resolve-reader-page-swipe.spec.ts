import { resolveReaderPageSwipe } from '@/features/reader/lib/resolve-reader-page-swipe';

describe('resolveReaderPageSwipe', () => {
  it('turns forward when the finger swipes left', () => {
    expect(resolveReaderPageSwipe({ deltaX: -80, deltaY: 10 })).toBe('next');
  });

  it('turns back when the finger swipes right', () => {
    expect(resolveReaderPageSwipe({ deltaX: 80, deltaY: -8 })).toBe('previous');
  });

  it('ignores a vertical drag and a short movement', () => {
    expect(resolveReaderPageSwipe({ deltaX: 10, deltaY: 90 })).toBeNull();
    expect(resolveReaderPageSwipe({ deltaX: -20, deltaY: 4 })).toBeNull();
  });
});
