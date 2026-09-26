import { resolveHomeNewGridLayout } from './resolve-home-new-grid-layout';

const GAP = 12;

describe('resolveHomeNewGridLayout', () => {
  it('keeps two columns on a narrow row and shrinks the card', () => {
    const actual = resolveHomeNewGridLayout({ contentWidth: 250, gap: GAP });
    expect(actual.columnCount).toBe(2);
    expect(actual.itemWidth).toBeLessThan(132);
    expect(actual.itemWidth * 2 + GAP).toBeCloseTo(250);
  });

  it('adds columns as the row gets wider', () => {
    const phone = resolveHomeNewGridLayout({ contentWidth: 320, gap: GAP });
    const tablet = resolveHomeNewGridLayout({ contentWidth: 720, gap: GAP });
    expect(phone.columnCount).toBe(2);
    expect(tablet.columnCount).toBeGreaterThan(phone.columnCount);
  });

  it('caps the column count on a large row', () => {
    const actual = resolveHomeNewGridLayout({ contentWidth: 1200, gap: GAP });
    expect(actual.columnCount).toBe(6);
  });
});
