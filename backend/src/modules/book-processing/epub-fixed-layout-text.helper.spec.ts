import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { EpubOcfHelper } from '@/modules/book-processing/epub-ocf.helper';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';

import { EpubFixedLayoutTextHelper } from './epub-fixed-layout-text.helper';

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
    <dc:identifier id="uid">urn:uuid:fxl-text</dc:identifier>
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

function createFixedPackageXml(): string {
  return createPackageXml({
    manifestItems: '<item id="p1" href="page1.xhtml" media-type="application/xhtml+xml"/>',
    spineItems: '<itemref idref="p1"/>',
  });
}

describe('EpubFixedLayoutTextHelper', () => {
  it('extracts SVG and absolutely positioned HTML runs', () => {
    const pageXml = `<html>
      <head><meta name="viewport" content="width=1200, height=1600"/></head>
      <body>
        <svg><text x="120" y="80">Harbor</text></svg>
        <div style="position:absolute; left:200px; top:400px; width:180px; height:24px">lights</div>
      </body>
    </html>`;
    const epubBytes = createEpubBytes(createFixedPackageXml(), [
      { name: 'OEBPS/page1.xhtml', data: Buffer.from(pageXml) },
    ]);
    const actualLayers = EpubFixedLayoutTextHelper.extract(EpubOcfHelper.open(epubBytes));
    expect(actualLayers).toHaveLength(1);
    expect(actualLayers[0]?.contentText).toContain('Harbor');
    expect(actualLayers[0]?.contentText).toContain('lights');
    expect(actualLayers[0]?.runs).toEqual([
      expect.objectContaining({ sortOrder: 0, text: 'Harbor', x: 120, y: 80 }),
      expect.objectContaining({
        sortOrder: 1,
        text: 'lights',
        x: 200,
        y: 400,
        width: 180,
        height: 24,
      }),
    ]);
  });

  it('converts percent positions using the page viewport', () => {
    const pageXml = `<html>
      <head><meta name="viewport" content="width=1200, height=1600"/></head>
      <body><div style="left:10%; top:25%">Beacon</div></body>
    </html>`;
    const epubBytes = createEpubBytes(createFixedPackageXml(), [
      { name: 'OEBPS/page1.xhtml', data: Buffer.from(pageXml) },
    ]);
    const actualLayers = EpubFixedLayoutTextHelper.extract(EpubOcfHelper.open(epubBytes));
    expect(actualLayers[0]?.runs).toEqual([
      expect.objectContaining({ text: 'Beacon', x: 120, y: 400 }),
    ]);
  });

  it('uses a 1000 by 1000 fallback when percent positions have no viewport', () => {
    const pageXml = `<html><body><div style="left:10%; top:20%">Fallback</div></body></html>`;
    const epubBytes = createEpubBytes(createFixedPackageXml(), [
      { name: 'OEBPS/page1.xhtml', data: Buffer.from(pageXml) },
    ]);
    const actualLayers = EpubFixedLayoutTextHelper.extract(EpubOcfHelper.open(epubBytes));
    expect(actualLayers[0]?.runs).toEqual([
      expect.objectContaining({ text: 'Fallback', x: 100, y: 200 }),
    ]);
  });

  it('skips em lengths and empty text runs', () => {
    const pageXml = `<html>
      <head><meta name="viewport" content="width=800, height=600"/></head>
      <body>
        <div style="left:2em; top:3em">Skip me</div>
        <div style="left:10px; top:20px">   </div>
        <text x="15" y="25">Kept</text>
      </body>
    </html>`;
    const epubBytes = createEpubBytes(createFixedPackageXml(), [
      { name: 'OEBPS/page1.xhtml', data: Buffer.from(pageXml) },
    ]);
    const actualLayers = EpubFixedLayoutTextHelper.extract(EpubOcfHelper.open(epubBytes));
    expect(actualLayers[0]?.runs).toEqual([
      expect.objectContaining({ text: 'Kept', x: 15, y: 25 }),
    ]);
  });

  it('keeps picture-only pages with empty searchable text', () => {
    const pageXml =
      '<html><head><meta name="viewport" content="width=800, height=600"/></head><body><img src="art.jpg"/></body></html>';
    const epubBytes = createEpubBytes(createFixedPackageXml(), [
      { name: 'OEBPS/page1.xhtml', data: Buffer.from(pageXml) },
    ]);
    const actualLayers = EpubFixedLayoutTextHelper.extract(EpubOcfHelper.open(epubBytes));
    expect(actualLayers).toEqual([
      expect.objectContaining({
        spineIndex: 0,
        href: 'OEBPS/page1.xhtml',
        contentText: '',
        runs: [],
      }),
    ]);
  });
});
