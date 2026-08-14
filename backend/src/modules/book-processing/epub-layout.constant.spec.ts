import { EPUB_LAYOUT } from './epub-layout.constant';

describe('EPUB_LAYOUT', () => {
  it('uses the EPUB rendition layout tokens', () => {
    expect(EPUB_LAYOUT.renditionLayoutProperty).toBe('rendition:layout');
    expect(EPUB_LAYOUT.prePaginated).toBe('pre-paginated');
    expect(EPUB_LAYOUT.reflowable).toBe('reflowable');
  });
});
