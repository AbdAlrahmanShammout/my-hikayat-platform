import { EPUB_FIXED_LAYOUT_TEXT } from './epub-fixed-layout-text.constant';

describe('EPUB_FIXED_LAYOUT_TEXT', () => {
  it('uses a square fallback viewport for percent conversion', () => {
    expect(EPUB_FIXED_LAYOUT_TEXT.percentFallbackWidth).toBe(1000);
    expect(EPUB_FIXED_LAYOUT_TEXT.percentFallbackHeight).toBe(1000);
  });
});
