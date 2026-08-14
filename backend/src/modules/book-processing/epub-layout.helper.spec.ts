import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { EPUB_LAYOUT } from '@/modules/book-processing/epub-layout.constant';
import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';

import { EpubLayoutHelper } from './epub-layout.helper';

const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

function createPackageXml(extraMetadata = ''): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:layout</dc:identifier>
    <dc:title>Layout Fixture</dc:title>
    <dc:language>en</dc:language>
    ${extraMetadata}
  </metadata>
  <manifest></manifest>
  <spine></spine>
</package>
`;
}

function createArchive(
  packageXml: string,
  extraEntries: { name: string; data: Buffer }[] = [],
): ZipArchive {
  return ZipArchive.fromBuffer(
    ZipArchive.createStored([
      { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
      { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
      { name: 'OEBPS/content.opf', data: Buffer.from(packageXml) },
      ...extraEntries,
    ]),
  );
}

describe('EpubLayoutHelper', () => {
  it('detects a pre-paginated rendition layout as fixed-layout', () => {
    const inputXml = createPackageXml('<meta property="rendition:layout">pre-paginated</meta>');
    const actualLayout = EpubLayoutHelper.detect(inputXml, createArchive(inputXml));
    expect(actualLayout).toBe(BookLayoutType.FIXED_LAYOUT);
  });

  it('detects an explicit reflowable rendition layout', () => {
    const inputXml = createPackageXml('<meta property="rendition:layout">reflowable</meta>');
    const actualLayout = EpubLayoutHelper.detect(inputXml, createArchive(inputXml));
    expect(actualLayout).toBe(BookLayoutType.REFLOWABLE);
  });

  it('defaults to reflowable when no layout metadata is present', () => {
    const inputXml = createPackageXml();
    const actualLayout = EpubLayoutHelper.detect(inputXml, createArchive(inputXml));
    expect(actualLayout).toBe(BookLayoutType.REFLOWABLE);
  });

  it('detects a content-attribute rendition layout as fixed-layout', () => {
    const inputXml = createPackageXml(
      '<meta property="rendition:layout" content="pre-paginated"/>',
    );
    const actualLayout = EpubLayoutHelper.detect(inputXml, createArchive(inputXml));
    expect(actualLayout).toBe(BookLayoutType.FIXED_LAYOUT);
  });

  it('detects a legacy fixed-layout meta as fixed-layout', () => {
    const inputXml = createPackageXml('<meta name="fixed-layout" content="true"/>');
    const actualLayout = EpubLayoutHelper.detect(inputXml, createArchive(inputXml));
    expect(actualLayout).toBe(BookLayoutType.FIXED_LAYOUT);
  });

  it('honors an explicit reflowable rendition over Apple display-options', () => {
    const inputXml = createPackageXml('<meta property="rendition:layout">reflowable</meta>');
    const appleXml = `<display_options>
  <platform name="*">
    <option name="fixed-layout">true</option>
  </platform>
</display_options>
`;
    const actualLayout = EpubLayoutHelper.detect(
      inputXml,
      createArchive(inputXml, [
        { name: EPUB_LAYOUT.appleDisplayOptionsPath, data: Buffer.from(appleXml) },
      ]),
    );
    expect(actualLayout).toBe(BookLayoutType.REFLOWABLE);
  });

  it('detects Apple display-options fixed-layout when OPF is silent', () => {
    const inputXml = createPackageXml();
    const appleXml = `<display_options>
  <platform name="*">
    <option name="fixed-layout">true</option>
  </platform>
</display_options>
`;
    const actualLayout = EpubLayoutHelper.detect(
      inputXml,
      createArchive(inputXml, [
        { name: EPUB_LAYOUT.appleDisplayOptionsPath, data: Buffer.from(appleXml) },
      ]),
    );
    expect(actualLayout).toBe(BookLayoutType.FIXED_LAYOUT);
  });
});
