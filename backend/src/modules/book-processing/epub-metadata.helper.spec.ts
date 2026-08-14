import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';

import { EpubMetadataHelper } from './epub-metadata.helper';

const PACKAGE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:lighthouse</dc:identifier>
    <dc:identifier>urn:isbn:ignore-me</dc:identifier>
    <dc:title>The Last Lighthouse</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>Jane Author</dc:creator>
    <dc:publisher>Harbor Press</dc:publisher>
    <dc:description>A reflowable chapter book.</dc:description>
  </metadata>
  <manifest></manifest>
  <spine></spine>
</package>
`;

describe('EpubMetadataHelper', () => {
  it('reads required and optional Dublin Core fields from the OPF package', () => {
    const actualMetadata = EpubMetadataHelper.extract(PACKAGE_XML, 'OEBPS/content.opf');
    expect(actualMetadata.packagePath).toBe('OEBPS/content.opf');
    expect(actualMetadata.epubVersion).toBe('3.0');
    expect(actualMetadata.identifier).toBe('urn:uuid:lighthouse');
    expect(actualMetadata.title).toBe('The Last Lighthouse');
    expect(actualMetadata.language).toBe('en');
    expect(actualMetadata.creator).toBe('Jane Author');
    expect(actualMetadata.publisher).toBe('Harbor Press');
    expect(actualMetadata.description).toBe('A reflowable chapter book.');
  });

  it('rejects a package missing a title', () => {
    const inputXml = PACKAGE_XML.replace('<dc:title>The Last Lighthouse</dc:title>', '');
    expect(() => EpubMetadataHelper.extract(inputXml, 'OEBPS/content.opf')).toThrow(
      BookProcessingInvalidEpubException,
    );
  });
});
