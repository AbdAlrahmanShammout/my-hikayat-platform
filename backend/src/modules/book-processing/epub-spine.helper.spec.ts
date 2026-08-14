import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { EpubOcfHelper } from '@/modules/book-processing/epub-ocf.helper';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';

import { EpubSpineHelper } from './epub-spine.helper';

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
    <dc:identifier id="uid">urn:uuid:spine</dc:identifier>
    <dc:title>Spine Fixture</dc:title>
    <dc:language>en</dc:language>
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

function createEpubArchive(
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

describe('EpubSpineHelper', () => {
  it('extracts linear spine documents with nav titles and stripped text', () => {
    const packageXml = createPackageXml({
      manifestItems: `
        <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
        <item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
        <item id="c2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
      `,
      spineItems: `
        <itemref idref="c1"/>
        <itemref idref="c2"/>
        <itemref idref="nav" linear="no"/>
      `,
    });
    const epubBytes = createEpubArchive(packageXml, [
      {
        name: 'OEBPS/nav.xhtml',
        data: Buffer.from(`<html><body><nav epub:type="toc">
          <ol>
            <li><a href="chapter1.xhtml">The Harbor</a></li>
            <li><a href="chapter2.xhtml">The Storm</a></li>
          </ol>
        </nav></body></html>`),
      },
      {
        name: 'OEBPS/chapter1.xhtml',
        data: Buffer.from(
          '<html><head><title>Ch1</title></head><body><h1>Ignored</h1><p>First chapter text.</p></body></html>',
        ),
      },
      {
        name: 'OEBPS/chapter2.xhtml',
        data: Buffer.from('<html><body><p>Second chapter text.</p></body></html>'),
      },
    ]);
    const actualChapters = EpubSpineHelper.extract(EpubOcfHelper.open(epubBytes));
    expect(actualChapters).toEqual([
      {
        spineIndex: 0,
        href: 'OEBPS/chapter1.xhtml',
        manifestId: 'c1',
        title: 'The Harbor',
        contentText: 'Ignored First chapter text.',
      },
      {
        spineIndex: 1,
        href: 'OEBPS/chapter2.xhtml',
        manifestId: 'c2',
        title: 'The Storm',
        contentText: 'Second chapter text.',
      },
    ]);
  });

  it('falls back to the first heading when nav titles are absent', () => {
    const packageXml = createPackageXml({
      manifestItems: '<item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>',
      spineItems: '<itemref idref="c1"/>',
    });
    const epubBytes = createEpubArchive(packageXml, [
      {
        name: 'OEBPS/chapter1.xhtml',
        data: Buffer.from('<html><body><h1>Dawn Watch</h1><p>Chapter body.</p></body></html>'),
      },
    ]);
    const actualChapters = EpubSpineHelper.extract(EpubOcfHelper.open(epubBytes));
    expect(actualChapters[0]?.title).toBe('Dawn Watch');
    expect(actualChapters[0]?.contentText).toBe('Dawn Watch Chapter body.');
  });

  it('rejects a spine with no linear documents', () => {
    const packageXml = createPackageXml({
      manifestItems:
        '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
      spineItems: '<itemref idref="nav"/>',
    });
    const epubBytes = createEpubArchive(packageXml, [
      { name: 'OEBPS/nav.xhtml', data: Buffer.from('<html><body><nav></nav></body></html>') },
    ]);
    expect(() => EpubSpineHelper.extract(EpubOcfHelper.open(epubBytes))).toThrow(
      BookProcessingInvalidEpubException,
    );
  });
});
