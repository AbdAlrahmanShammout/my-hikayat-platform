import { EPUB_SPINE } from './epub-spine.constant';

describe('EPUB_SPINE', () => {
  it('uses EPUB spine and document media-type tokens', () => {
    expect(EPUB_SPINE.linearYes).toBe('yes');
    expect(EPUB_SPINE.navProperty).toBe('nav');
    expect(EPUB_SPINE.xhtmlMediaType).toBe('application/xhtml+xml');
  });
});
