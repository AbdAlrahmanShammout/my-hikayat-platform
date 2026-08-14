import { EPUB_FIXED_LAYOUT } from './epub-fixed-layout.constant';

describe('EPUB_FIXED_LAYOUT', () => {
  it('uses EPUB page-spread and rendition tokens', () => {
    expect(EPUB_FIXED_LAYOUT.spreadNone).toBe('none');
    expect(EPUB_FIXED_LAYOUT.pageSpreadLeft).toBe('page-spread-left');
    expect(EPUB_FIXED_LAYOUT.renditionSpreadProperty).toBe('rendition:spread');
  });
});
