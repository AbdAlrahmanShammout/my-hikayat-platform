import { ExtractedEpubChapter } from '@/modules/book-processing/defs/book-processing-service.defs';
import { EPUB_SPINE } from '@/modules/book-processing/epub-spine.constant';
import { EpubOcfOpenedPackage } from '@/modules/book-processing/epub-ocf.helper';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';

const MANIFEST_ITEM_PATTERN = /<item\b[^>]*\/?>/gi;
const ITEMREF_PATTERN = /<itemref\b[^>]*\/?>/gi;
const ANCHOR_PATTERN = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
const HEADING_PATTERN = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i;
const DOCUMENT_TITLE_PATTERN = /<title\b[^>]*>([\s\S]*?)<\/title>/i;

type ManifestItem = {
  readonly id: string;
  readonly href: string;
  readonly mediaType: string;
  readonly properties: string;
};

type SpineRef = {
  readonly idref: string;
  readonly isLinear: boolean;
  readonly properties: string;
};

export type EpubLinearDocument = {
  readonly spineIndex: number;
  readonly href: string;
  readonly manifestId: string;
  readonly properties: string;
  readonly documentXml: string;
};

export class EpubSpineHelper {
  static extract(opened: EpubOcfOpenedPackage): ExtractedEpubChapter[] {
    const titlesByHref: Map<string, string> = readNavTitles(
      opened.packagePath,
      parseManifest(opened.packageXml),
      opened.archive,
    );
    const documents: EpubLinearDocument[] = EpubSpineHelper.listLinearDocuments(opened);
    if (documents.length === 0) {
      throw new BookProcessingInvalidEpubException('spine has no linear documents');
    }
    return documents.map((document) => ({
      spineIndex: document.spineIndex,
      href: document.href,
      manifestId: document.manifestId,
      title: resolveChapterTitle(document.href, document.documentXml, titlesByHref),
      contentText: stripMarkup(document.documentXml),
    }));
  }

  static listLinearDocuments(opened: EpubOcfOpenedPackage): EpubLinearDocument[] {
    const manifestById: Map<string, ManifestItem> = parseManifest(opened.packageXml);
    const documents: EpubLinearDocument[] = [];
    for (const spineRef of parseSpine(opened.packageXml)) {
      const document: EpubLinearDocument | null = readLinearDocument({
        packagePath: opened.packagePath,
        archive: opened.archive,
        manifestById,
        spineRef,
        spineIndex: documents.length,
      });
      if (document !== null) {
        documents.push(document);
      }
    }
    return documents;
  }
}

function parseManifest(packageXml: string): Map<string, ManifestItem> {
  const items = new Map<string, ManifestItem>();
  for (const tag of matchTags(packageXml, MANIFEST_ITEM_PATTERN)) {
    const id: string | null = readAttribute(tag, 'id');
    const href: string | null = readAttribute(tag, 'href');
    const mediaType: string | null = readAttribute(tag, 'media-type');
    if (id === null || href === null || mediaType === null) {
      continue;
    }
    items.set(id, {
      id,
      href,
      mediaType,
      properties: readAttribute(tag, 'properties') ?? '',
    });
  }
  return items;
}

function parseSpine(packageXml: string): SpineRef[] {
  return matchTags(packageXml, ITEMREF_PATTERN).flatMap((tag) => {
    const idref: string | null = readAttribute(tag, 'idref');
    if (idref === null) {
      return [];
    }
    const linear: string | null = readAttribute(tag, 'linear');
    return [
      {
        idref,
        isLinear: linear === null || linear.toLowerCase() === EPUB_SPINE.linearYes,
        properties: readAttribute(tag, 'properties') ?? '',
      },
    ];
  });
}

function readNavTitles(
  packagePath: string,
  manifestById: Map<string, ManifestItem>,
  archive: ZipArchive,
): Map<string, string> {
  const titles = new Map<string, string>();
  const navItem: ManifestItem | undefined = [...manifestById.values()].find((item) =>
    item.properties.split(/\s+/).includes(EPUB_SPINE.navProperty),
  );
  if (navItem === undefined) {
    return titles;
  }
  const navPath: string = resolvePackageHref(packagePath, navItem.href);
  if (!archive.has(navPath)) {
    return titles;
  }
  const navXml: string = archive.read(navPath).toString('utf8');
  for (const tag of matchTags(navXml, ANCHOR_PATTERN)) {
    const href: string | null = readAttribute(tag, 'href');
    const title: string = stripMarkup(tag);
    if (href === null || title.length === 0) {
      continue;
    }
    const resolvedHref: string = resolvePackageHref(packagePath, href);
    if (!titles.has(resolvedHref)) {
      titles.set(resolvedHref, title);
    }
  }
  return titles;
}

function readLinearDocument(input: {
  readonly packagePath: string;
  readonly archive: ZipArchive;
  readonly manifestById: Map<string, ManifestItem>;
  readonly spineRef: SpineRef;
  readonly spineIndex: number;
}): EpubLinearDocument | null {
  if (!input.spineRef.isLinear) {
    return null;
  }
  const item: ManifestItem | undefined = input.manifestById.get(input.spineRef.idref);
  if (item === undefined) {
    throw new BookProcessingInvalidEpubException(
      `spine idref ${input.spineRef.idref} is missing from the manifest`,
    );
  }
  if (item.properties.split(/\s+/).includes(EPUB_SPINE.navProperty) || !isDocumentItem(item)) {
    return null;
  }
  const href: string = resolvePackageHref(input.packagePath, item.href);
  if (!input.archive.has(href)) {
    throw new BookProcessingInvalidEpubException(`spine document is missing: ${href}`);
  }
  return {
    spineIndex: input.spineIndex,
    href,
    manifestId: item.id,
    properties: `${item.properties} ${input.spineRef.properties}`.trim(),
    documentXml: input.archive.read(href).toString('utf8'),
  };
}

function resolveChapterTitle(
  href: string,
  documentXml: string,
  titlesByHref: Map<string, string>,
): string {
  const navTitle: string | undefined = titlesByHref.get(href);
  if (navTitle !== undefined) {
    return navTitle;
  }
  const headingMatch: RegExpMatchArray | null = documentXml.match(HEADING_PATTERN);
  if (headingMatch?.[1] !== undefined) {
    const heading: string = stripMarkup(headingMatch[1]);
    if (heading.length > 0) {
      return heading;
    }
  }
  const titleMatch: RegExpMatchArray | null = documentXml.match(DOCUMENT_TITLE_PATTERN);
  if (titleMatch?.[1] !== undefined) {
    const documentTitle: string = stripMarkup(titleMatch[1]);
    if (documentTitle.length > 0) {
      return documentTitle;
    }
  }
  return fileNameStem(href);
}

function isDocumentItem(item: ManifestItem): boolean {
  const mediaType: string = item.mediaType.trim().toLowerCase();
  return mediaType === EPUB_SPINE.xhtmlMediaType || mediaType === EPUB_SPINE.htmlMediaType;
}

function resolvePackageHref(packagePath: string, href: string): string {
  const withoutFragment: string = decodeHref(href).split('#')[0] ?? '';
  const directory: string = packagePath.includes('/')
    ? packagePath.slice(0, packagePath.lastIndexOf('/') + 1)
    : '';
  return normalizePath(`${directory}${withoutFragment}`);
}

function decodeHref(href: string): string {
  try {
    return decodeURIComponent(href);
  } catch {
    return href;
  }
}

function normalizePath(path: string): string {
  const parts: string[] = [];
  for (const segment of path.replaceAll('\\', '/').split('/')) {
    if (segment === '' || segment === '.') {
      continue;
    }
    if (segment === '..') {
      parts.pop();
      continue;
    }
    parts.push(segment);
  }
  return parts.join('/');
}

function fileNameStem(href: string): string {
  const fileName: string = href.split('/').at(-1) ?? href;
  const dotIndex: number = fileName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return fileName;
  }
  return fileName.slice(0, dotIndex);
}

function matchTags(xml: string, pattern: RegExp): string[] {
  return xml.match(new RegExp(pattern.source, pattern.flags)) ?? [];
}

function readAttribute(tag: string, name: string): string | null {
  const pattern = new RegExp(`${escapeRegExp(name)}\\s*=\\s*["']([^"']+)["']`, 'i');
  const match: RegExpMatchArray | null = tag.match(pattern);
  if (match?.[1] === undefined) {
    return null;
  }
  const value: string = decodeXmlText(match[1]);
  return value.length === 0 ? null : value;
}

function stripMarkup(value: string): string {
  return decodeXmlText(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeXmlText(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
