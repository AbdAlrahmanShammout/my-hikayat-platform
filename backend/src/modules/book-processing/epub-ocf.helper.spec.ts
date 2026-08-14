import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';

import { EpubOcfHelper } from './epub-ocf.helper';

const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

const PACKAGE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:test</dc:identifier>
    <dc:title>Test</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest></manifest>
  <spine></spine>
</package>
`;

function createMinimalEpubBytes(): Buffer {
  return ZipArchive.createStored([
    { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(PACKAGE_XML) },
  ]);
}

describe('EpubOcfHelper', () => {
  it('accepts a stored OCF EPUB with a package document', () => {
    expect(() => EpubOcfHelper.validate(createMinimalEpubBytes())).not.toThrow();
  });

  it('opens the package document for later metadata extraction', () => {
    const actualOpened = EpubOcfHelper.open(createMinimalEpubBytes());
    expect(actualOpened.packagePath).toBe('OEBPS/content.opf');
    expect(actualOpened.packageXml).toContain('<dc:title>Test</dc:title>');
  });

  it('rejects a PDF payload', () => {
    expect(() => EpubOcfHelper.validate(Buffer.from('%PDF-1.4'))).toThrow(
      BookProcessingInvalidEpubException,
    );
  });

  it('rejects an archive whose first entry is not mimetype', () => {
    const inputBytes = ZipArchive.createStored([
      { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
      { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
      { name: 'OEBPS/content.opf', data: Buffer.from(PACKAGE_XML) },
    ]);
    expect(() => EpubOcfHelper.validate(inputBytes)).toThrow(BookProcessingInvalidEpubException);
  });

  it('rejects a missing OPF package document', () => {
    const inputBytes = ZipArchive.createStored([
      { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
      { name: EPUB_OCF.containerPath, data: Buffer.from(CONTAINER_XML) },
    ]);
    expect(() => EpubOcfHelper.validate(inputBytes)).toThrow(BookProcessingInvalidEpubException);
  });
});
