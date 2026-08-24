import { zipSync } from 'fflate';

import { parseFixedLayoutEpub } from '@/features/reader/lib/parse-fixed-layout-epub';

function createFixedLayoutEpubBytes(): Uint8Array {
  const container = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  const packageXml = `<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:fixed</dc:identifier>
    <dc:title>Picture Harbor</dc:title>
    <dc:language>en</dc:language>
    <meta property="rendition:layout">pre-paginated</meta>
  </metadata>
  <manifest>
    <item id="p1" href="p1.xhtml" media-type="application/xhtml+xml"/>
    <item id="p2" href="p2.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="p1" properties="page-spread-left"/>
    <itemref idref="p2" properties="page-spread-right"/>
  </spine>
</package>`;
  const page1 = `<html><head><title>Left</title><meta name="viewport" content="width=1200, height=1600"/></head><body><h1>Left Page</h1></body></html>`;
  const page2 = `<html><head><title>Right</title><meta name="viewport" content="width=1200, height=1600"/></head><body><h1>Right Page</h1></body></html>`;
  return zipSync({
    mimetype: new TextEncoder().encode('application/epub+zip'),
    'META-INF/container.xml': new TextEncoder().encode(container),
    'OEBPS/content.opf': new TextEncoder().encode(packageXml),
    'OEBPS/p1.xhtml': new TextEncoder().encode(page1),
    'OEBPS/p2.xhtml': new TextEncoder().encode(page2),
  });
}

describe('parseFixedLayoutEpub', () => {
  it('pairs left and right pages into one spread with viewport dimensions', () => {
    const actual = parseFixedLayoutEpub(createFixedLayoutEpubBytes());
    expect(actual.pages).toHaveLength(2);
    expect(actual.spreads).toHaveLength(1);
    expect(actual.spreads[0]?.leftSpineIndex).toBe(0);
    expect(actual.spreads[0]?.rightSpineIndex).toBe(1);
    expect(actual.pages[0]?.width).toBe(1200);
    expect(actual.pages[0]?.height).toBe(1600);
    expect(actual.pages[0]?.htmlDocument).toContain('Left Page');
  });

  it('rejects a page without viewport dimensions', () => {
    const broken = zipSync({
      'META-INF/container.xml': new TextEncoder().encode(`<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`),
      'OEBPS/content.opf': new TextEncoder().encode(`<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:broken</dc:identifier>
    <dc:title>Broken</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="p1" href="p1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="p1"/>
  </spine>
</package>`),
      'OEBPS/p1.xhtml': new TextEncoder().encode(
        '<html><body><p>No viewport.</p></body></html>',
      ),
    });
    expect(() => parseFixedLayoutEpub(broken)).toThrow(/viewport/i);
  });
});
