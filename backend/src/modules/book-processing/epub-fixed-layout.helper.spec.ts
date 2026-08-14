import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { EpubOcfHelper } from '@/modules/book-processing/epub-ocf.helper';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';

import { EpubFixedLayoutHelper } from './epub-fixed-layout.helper';

const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

function createPackageXml(input: {
  readonly extraMetadata?: string;
  readonly manifestItems: string;
  readonly spineItems: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:fxl</dc:identifier>
    <dc:title>Picture Book</dc:title>
    <dc:language>en</dc:language>
    <meta property="rendition:layout">pre-paginated</meta>
    ${input.extraMetadata ?? ''}
  </metadata>
  <manifest>
    ${input.manifestItems}
  </manifest>
  <spine>
    ${input.spineItems}
  </spine>
</package>
`;
}

function createEpubBytes(
  packageXml: string,
  extraEntries: { name: string; data: Buffer }[],
): Buffer {
  return ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(packageXml) },
    ...extraEntries,
  ]);
}

function createPageXml(title: string, width: number, height: number): string {
  return `<html><head><title>${title}</title><meta name="viewport" content="width=${width}, height=${height}"/></head><body><h1>${title}</h1></body></html>`;
}

describe('EpubFixedLayoutHelper', () => {
  it('pairs left and right pages into one spread with viewport dimensions', () => {
    const packageXml = createPackageXml({
      manifestItems: `
        <item id="p1" href="page1.xhtml" media-type="application/xhtml+xml"/>
        <item id="p2" href="page2.xhtml" media-type="application/xhtml+xml"/>
      `,
      spineItems: `
        <itemref idref="p1" properties="page-spread-left"/>
        <itemref idref="p2" properties="page-spread-right"/>
      `,
    });
    const epubBytes = createEpubBytes(packageXml, [
      { name: 'OEBPS/page1.xhtml', data: Buffer.from(createPageXml('Left Page', 1200, 1600)) },
      { name: 'OEBPS/page2.xhtml', data: Buffer.from(createPageXml('Right Page', 1200, 1600)) },
    ]);
    const actualLayout = EpubFixedLayoutHelper.extract(EpubOcfHelper.open(epubBytes));
    expect(actualLayout.pages).toEqual([
      expect.objectContaining({
        spineIndex: 0,
        title: 'Left Page',
        width: 1200,
        height: 1600,
        spreadRole: BookPageSpreadRole.LEFT,
      }),
      expect.objectContaining({
        spineIndex: 1,
        title: 'Right Page',
        spreadRole: BookPageSpreadRole.RIGHT,
      }),
    ]);
    expect(actualLayout.spreads).toEqual([
      {
        spreadIndex: 0,
        leftSpineIndex: 0,
        rightSpineIndex: 1,
        centerSpineIndex: null,
      },
    ]);
  });

  it('creates one spread per page when rendition spread is none', () => {
    const packageXml = createPackageXml({
      extraMetadata: '<meta property="rendition:spread">none</meta>',
      manifestItems: `
        <item id="p1" href="page1.xhtml" media-type="application/xhtml+xml"/>
        <item id="p2" href="page2.xhtml" media-type="application/xhtml+xml"/>
      `,
      spineItems: '<itemref idref="p1"/><itemref idref="p2"/>',
    });
    const epubBytes = createEpubBytes(packageXml, [
      { name: 'OEBPS/page1.xhtml', data: Buffer.from(createPageXml('One', 800, 600)) },
      { name: 'OEBPS/page2.xhtml', data: Buffer.from(createPageXml('Two', 800, 600)) },
    ]);
    const actualLayout = EpubFixedLayoutHelper.extract(EpubOcfHelper.open(epubBytes));
    expect(actualLayout.pages.map((page) => page.spreadRole)).toEqual([
      BookPageSpreadRole.SINGLE,
      BookPageSpreadRole.SINGLE,
    ]);
    expect(actualLayout.spreads).toHaveLength(2);
    expect(actualLayout.spreads[0]?.centerSpineIndex).toBe(0);
    expect(actualLayout.spreads[1]?.centerSpineIndex).toBe(1);
  });

  it('rejects a page without viewport dimensions', () => {
    const packageXml = createPackageXml({
      manifestItems: '<item id="p1" href="page1.xhtml" media-type="application/xhtml+xml"/>',
      spineItems: '<itemref idref="p1"/>',
    });
    const epubBytes = createEpubBytes(packageXml, [
      {
        name: 'OEBPS/page1.xhtml',
        data: Buffer.from('<html><body><p>No viewport.</p></body></html>'),
      },
    ]);
    expect(() => EpubFixedLayoutHelper.extract(EpubOcfHelper.open(epubBytes))).toThrow(
      BookProcessingInvalidEpubException,
    );
  });
});
