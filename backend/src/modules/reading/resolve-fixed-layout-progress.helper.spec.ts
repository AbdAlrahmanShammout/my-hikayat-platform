import { resolveFixedLayoutProgressPercent } from './resolve-fixed-layout-progress.helper';

describe('resolveFixedLayoutProgressPercent', () => {
  it('uses pageNumber against total pages when pages exist', () => {
    const actualPercent = resolveFixedLayoutProgressPercent({
      pageNumber: 8,
      pageCount: 10,
      spreadIndex: 3,
      spreadCount: 5,
    });
    expect(actualPercent).toBe(80);
  });

  it('falls back to spreadIndex when page data is missing', () => {
    const actualPercent = resolveFixedLayoutProgressPercent({
      pageNumber: 4,
      pageCount: 0,
      spreadIndex: 1,
      spreadCount: 4,
    });
    expect(actualPercent).toBe(50);
  });

  it('returns 0 when neither pages nor spreads are available', () => {
    const actualPercent = resolveFixedLayoutProgressPercent({
      pageNumber: 2,
      pageCount: 0,
      spreadIndex: 1,
      spreadCount: 0,
    });
    expect(actualPercent).toBe(0);
  });

  it('returns 100 on the last page', () => {
    const actualPercent = resolveFixedLayoutProgressPercent({
      pageNumber: 12,
      pageCount: 12,
      spreadIndex: 5,
      spreadCount: 6,
    });
    expect(actualPercent).toBe(100);
  });
});
