import { EPUB_OCF } from './epub-ocf.constant';

describe('EPUB_OCF', () => {
  it('uses the OCF mimetype and container paths', () => {
    expect(EPUB_OCF.mimetypePath).toBe('mimetype');
    expect(EPUB_OCF.mimetypeValue).toBe('application/epub+zip');
    expect(EPUB_OCF.containerPath).toBe('META-INF/container.xml');
    expect(EPUB_OCF.packageMediaType).toBe('application/oebps-package+xml');
  });
});
