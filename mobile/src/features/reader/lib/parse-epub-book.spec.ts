import { zipSync } from 'fflate';

import { parseEpubBook } from '@/features/reader/lib/parse-epub-book';

function createMinimalEpubBytes(): Uint8Array {
  const container = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  const packageXml = `<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:test</dc:identifier>
    <dc:title>Harbor Lights</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="c1" href="chap1.xhtml" media-type="application/xhtml+xml"/>
    <item id="c2" href="chap2.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="c1"/>
    <itemref idref="c2"/>
  </spine>
</package>`;
  const chapter1 = `<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>One</title></head>
<body><h1>Dawn</h1><p>The harbor woke early.</p></body></html>`;
  const chapter2 = `<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Two</title></head>
<body><h1>Dusk</h1><p>Lanterns along the pier.</p></body></html>`;
  return zipSync({
    mimetype: new TextEncoder().encode('application/epub+zip'),
    'META-INF/container.xml': new TextEncoder().encode(container),
    'OEBPS/content.opf': new TextEncoder().encode(packageXml),
    'OEBPS/chap1.xhtml': new TextEncoder().encode(chapter1),
    'OEBPS/chap2.xhtml': new TextEncoder().encode(chapter2),
  });
}

describe('parseEpubBook', () => {
  it('parses linear spine chapters from a minimal EPUB', () => {
    const actual = parseEpubBook(createMinimalEpubBytes());
    expect(actual.chapters).toHaveLength(2);
    expect(actual.chapters[0]?.title).toBe('Dawn');
    expect(actual.chapters[1]?.title).toBe('Dusk');
    expect(actual.chapters[0]?.htmlDocument).toContain('harbor woke early');
  });

  it('rejects an archive without a package rootfile', () => {
    const broken = zipSync({
      'META-INF/container.xml': new TextEncoder().encode('<container></container>'),
    });
    expect(() => parseEpubBook(broken)).toThrow(/package path/i);
  });
});
