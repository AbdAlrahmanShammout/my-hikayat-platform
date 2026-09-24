import { ZipArchive } from '../src/modules/book-processing/zip-archive.helper';

const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

export type DemoEpubChapter = {
  readonly title: string;
  readonly contentText: string;
};

export type CreateDemoEpubInput = {
  readonly slug: string;
  readonly title: string;
  readonly authorName: string;
  readonly language: string;
  readonly layoutType: 'reflowable' | 'fixed_layout';
  readonly chapters: readonly DemoEpubChapter[];
};

/**
 * Builds a stored-compression EPUB 3 package the reader can decrypt and parse.
 */
export function createDemoEpub(input: CreateDemoEpubInput): Buffer {
  if (input.layoutType === 'fixed_layout') {
    return createFixedLayoutEpub(input);
  }
  return createReflowableEpub(input);
}

function createReflowableEpub(input: CreateDemoEpubInput): Buffer {
  const chapters: readonly DemoEpubChapter[] = input.chapters;
  const manifestItems: string = chapters
    .map(
      (_chapter, index) =>
        `<item id="c${index}" href="text/chapter-${index}.xhtml" media-type="application/xhtml+xml"/>`,
    )
    .join('\n        ');
  const spineItems: string = chapters
    .map((_chapter, index) => `<itemref idref="c${index}"/>`)
    .join('\n        ');
  const packageXml: string = createPackageXml({
    input,
    extraMetadata: '<meta property="rendition:layout">reflowable</meta>',
    manifestItems,
    spineItems,
  });
  const entries = [
    { name: 'mimetype', data: Buffer.from('application/epub+zip') },
    { name: 'META-INF/container.xml', data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(packageXml) },
    ...chapters.map((chapter, index) => ({
      name: `OEBPS/text/chapter-${index}.xhtml`,
      data: Buffer.from(createReflowableChapterXhtml(chapter)),
    })),
  ];
  return ZipArchive.createStored(entries);
}

function createFixedLayoutEpub(input: CreateDemoEpubInput): Buffer {
  const pages: readonly DemoEpubChapter[] = expandFixedLayoutPages(input);
  const manifestItems: string = pages
    .map(
      (_page, index) =>
        `<item id="p${index}" href="pages/page-${index}.xhtml" media-type="application/xhtml+xml"/>`,
    )
    .join('\n        ');
  const spineItems: string = pages
    .map((_page, index) => `<itemref idref="p${index}"/>`)
    .join('\n        ');
  const packageXml: string = createPackageXml({
    input,
    extraMetadata: `<meta property="rendition:layout">pre-paginated</meta>
    <meta property="rendition:spread">auto</meta>
    <meta name="viewport" content="width=1200, height=1800"/>`,
    manifestItems,
    spineItems,
  });
  const entries = [
    { name: 'mimetype', data: Buffer.from('application/epub+zip') },
    { name: 'META-INF/container.xml', data: Buffer.from(CONTAINER_XML) },
    { name: 'OEBPS/content.opf', data: Buffer.from(packageXml) },
    ...pages.map((page, index) => ({
      name: `OEBPS/pages/page-${index}.xhtml`,
      data: Buffer.from(createFixedPageXhtml(input.title, page, index)),
    })),
  ];
  return ZipArchive.createStored(entries);
}

function expandFixedLayoutPages(input: CreateDemoEpubInput): DemoEpubChapter[] {
  const pages: DemoEpubChapter[] = [];
  for (const chapter of input.chapters) {
    const paragraphs: string[] = chapter.contentText
      .split(/(?<=\.)\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    if (paragraphs.length === 0) {
      pages.push(chapter);
      continue;
    }
    paragraphs.forEach((paragraph, index) => {
      pages.push({
        title: index === 0 ? chapter.title : `${chapter.title} · ${index + 1}`,
        contentText: paragraph,
      });
    });
  }
  return pages.length > 0 ? pages : [...input.chapters];
}

function createPackageXml(input: {
  readonly input: CreateDemoEpubInput;
  readonly extraMetadata: string;
  readonly manifestItems: string;
  readonly spineItems: string;
}): string {
  const book: CreateDemoEpubInput = input.input;
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:demo-${escapeXml(book.slug)}</dc:identifier>
    <dc:title>${escapeXml(book.title)}</dc:title>
    <dc:language>${escapeXml(book.language)}</dc:language>
    <dc:creator>${escapeXml(book.authorName)}</dc:creator>
    ${input.extraMetadata}
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

function createReflowableChapterXhtml(chapter: DemoEpubChapter): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
  <head>
    <title>${escapeXml(chapter.title)}</title>
  </head>
  <body>
    <h1>${escapeXml(chapter.title)}</h1>
    <p>${escapeXml(chapter.contentText)}</p>
  </body>
</html>
`;
}

function createFixedPageXhtml(
  bookTitle: string,
  page: DemoEpubChapter,
  pageIndex: number,
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
  <head>
    <title>${escapeXml(page.title)}</title>
    <meta name="viewport" content="width=1200, height=1800"/>
    <style>
      body { margin: 0; width: 1200px; height: 1800px; box-sizing: border-box; padding: 96px; background: #1F3A4D; color: #F7F4EF; font-family: Georgia, serif; }
      .kicker { font-size: 28px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.7; }
      h1 { font-size: 64px; line-height: 1.15; }
      p { font-size: 36px; line-height: 1.45; }
    </style>
  </head>
  <body>
    <p class="kicker">${escapeXml(bookTitle)} · ${pageIndex + 1}</p>
    <h1>${escapeXml(page.title)}</h1>
    <p>${escapeXml(page.contentText)}</p>
  </body>
</html>
`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
