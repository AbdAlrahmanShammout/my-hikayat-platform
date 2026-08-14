import {
  ExtractedEpubFixedLayout,
  ExtractedEpubPage,
  ExtractedEpubSpread,
} from '@/modules/book-processing/defs/book-processing-service.defs';
import { EPUB_FIXED_LAYOUT } from '@/modules/book-processing/epub-fixed-layout.constant';
import { EpubOcfOpenedPackage } from '@/modules/book-processing/epub-ocf.helper';
import { EpubLinearDocument, EpubSpineHelper } from '@/modules/book-processing/epub-spine.helper';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';

const VIEWPORT_NAME_PATTERN =
  /<meta\b[^>]*(?:name\s*=\s*["']viewport["'][^>]*content\s*=\s*["']([^"']+)["']|content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']viewport["'])[^>]*\/?>/i;
const RENDITION_VIEWPORT_BODY_PATTERN =
  /<meta\b[^>]*\bproperty\s*=\s*["']rendition:viewport["'][^>]*>([\s\S]*?)<\/meta>/i;
const ORIGINAL_RESOLUTION_PATTERN =
  /<meta\b[^>]*\bname\s*=\s*["']original-resolution["'][^>]*\bcontent\s*=\s*["'](\d+)\s*x\s*(\d+)["'][^>]*\/?>/i;
const RENDITION_SPREAD_BODY_PATTERN =
  /<meta\b[^>]*\bproperty\s*=\s*["']rendition:spread["'][^>]*>([\s\S]*?)<\/meta>/i;
const RENDITION_SPREAD_CONTENT_PATTERN =
  /<meta\b[^>]*(?:(?:property|name)\s*=\s*["']rendition:spread["'][^>]*content\s*=\s*["']([^"']+)["']|content\s*=\s*["']([^"']+)["'][^>]*(?:property|name)\s*=\s*["']rendition:spread["'])[^>]*\/?>/i;
const HEADING_PATTERN = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i;
const DOCUMENT_TITLE_PATTERN = /<title\b[^>]*>([\s\S]*?)<\/title>/i;
const WIDTH_PATTERN = /width\s*=\s*(\d+(?:\.\d+)?)/i;
const HEIGHT_PATTERN = /height\s*=\s*(\d+(?:\.\d+)?)/i;

type PageDimensions = {
  readonly width: number;
  readonly height: number;
};

type DeclaredSpreadRole = BookPageSpreadRole | 'auto';

type SpreadBuilder = {
  pages: ExtractedEpubPage[];
  spreads: ExtractedEpubSpread[];
  pending: ExtractedEpubPage | null;
};

export class EpubFixedLayoutHelper {
  static extract(opened: EpubOcfOpenedPackage): ExtractedEpubFixedLayout {
    const documents: EpubLinearDocument[] = EpubSpineHelper.listLinearDocuments(opened);
    if (documents.length === 0) {
      throw new BookProcessingInvalidEpubException('spine has no linear documents');
    }
    const packageViewport: PageDimensions | null = readViewport(opened.packageXml);
    const spreadNone: boolean =
      readRenditionSpread(opened.packageXml) === EPUB_FIXED_LAYOUT.spreadNone;
    const pages: ExtractedEpubPage[] = documents.map((document) =>
      toExtractedPage(document, packageViewport),
    );
    return assignSpreads(pages, documents, spreadNone);
  }

  static readViewport(xml: string): { readonly width: number; readonly height: number } | null {
    return readViewport(xml);
  }
}

function toExtractedPage(
  document: EpubLinearDocument,
  packageViewport: PageDimensions | null,
): ExtractedEpubPage {
  const viewport: PageDimensions | null = readViewport(document.documentXml) ?? packageViewport;
  if (viewport === null) {
    throw new BookProcessingInvalidEpubException(`page viewport is missing: ${document.href}`);
  }
  return {
    spineIndex: document.spineIndex,
    href: document.href,
    manifestId: document.manifestId,
    title: readPageTitle(document.href, document.documentXml),
    width: viewport.width,
    height: viewport.height,
    spreadRole: BookPageSpreadRole.SINGLE,
  };
}

function assignSpreads(
  pages: ExtractedEpubPage[],
  documents: EpubLinearDocument[],
  spreadNone: boolean,
): ExtractedEpubFixedLayout {
  const builder: SpreadBuilder = { pages: [], spreads: [], pending: null };
  pages.forEach((page, index) => {
    const role: DeclaredSpreadRole = readDeclaredRole(
      documents[index]?.properties ?? '',
      spreadNone,
    );
    applyDeclaredRole(builder, page, role);
  });
  flushPending(builder);
  return { pages: builder.pages, spreads: builder.spreads };
}

function applyDeclaredRole(
  builder: SpreadBuilder,
  page: ExtractedEpubPage,
  role: DeclaredSpreadRole,
): void {
  if (role === BookPageSpreadRole.CENTER || role === BookPageSpreadRole.SINGLE) {
    flushPending(builder);
    pushSoloSpread(builder, withRole(page, role));
    return;
  }
  if (role === BookPageSpreadRole.LEFT) {
    flushPending(builder);
    builder.pending = withRole(page, BookPageSpreadRole.LEFT);
    return;
  }
  if (role === BookPageSpreadRole.RIGHT) {
    if (builder.pending !== null) {
      pushPairSpread(builder, builder.pending, withRole(page, BookPageSpreadRole.RIGHT));
      builder.pending = null;
      return;
    }
    pushSoloSpread(builder, withRole(page, BookPageSpreadRole.RIGHT));
    return;
  }
  if (builder.pending !== null) {
    pushPairSpread(builder, builder.pending, withRole(page, BookPageSpreadRole.RIGHT));
    builder.pending = null;
    return;
  }
  builder.pending = withRole(page, BookPageSpreadRole.LEFT);
}

function flushPending(builder: SpreadBuilder): void {
  if (builder.pending === null) {
    return;
  }
  pushSoloSpread(builder, withRole(builder.pending, BookPageSpreadRole.SINGLE));
  builder.pending = null;
}

function pushSoloSpread(builder: SpreadBuilder, page: ExtractedEpubPage): void {
  const spreadIndex: number = builder.spreads.length;
  builder.pages.push(page);
  builder.spreads.push({
    spreadIndex,
    leftSpineIndex: null,
    rightSpineIndex: page.spreadRole === BookPageSpreadRole.RIGHT ? page.spineIndex : null,
    centerSpineIndex: page.spreadRole === BookPageSpreadRole.RIGHT ? null : page.spineIndex,
  });
}

function pushPairSpread(
  builder: SpreadBuilder,
  leftPage: ExtractedEpubPage,
  rightPage: ExtractedEpubPage,
): void {
  const spreadIndex: number = builder.spreads.length;
  builder.pages.push(withRole(leftPage, BookPageSpreadRole.LEFT));
  builder.pages.push(rightPage);
  builder.spreads.push({
    spreadIndex,
    leftSpineIndex: leftPage.spineIndex,
    rightSpineIndex: rightPage.spineIndex,
    centerSpineIndex: null,
  });
}

function withRole(page: ExtractedEpubPage, spreadRole: BookPageSpreadRole): ExtractedEpubPage {
  return { ...page, spreadRole };
}

function readDeclaredRole(properties: string, spreadNone: boolean): DeclaredSpreadRole {
  const tokens: string[] = properties
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
  if (
    tokens.includes(EPUB_FIXED_LAYOUT.pageSpreadLeft) ||
    tokens.includes(EPUB_FIXED_LAYOUT.renditionPageSpreadLeft)
  ) {
    return BookPageSpreadRole.LEFT;
  }
  if (
    tokens.includes(EPUB_FIXED_LAYOUT.pageSpreadRight) ||
    tokens.includes(EPUB_FIXED_LAYOUT.renditionPageSpreadRight)
  ) {
    return BookPageSpreadRole.RIGHT;
  }
  if (
    tokens.includes(EPUB_FIXED_LAYOUT.pageSpreadCenter) ||
    tokens.includes(EPUB_FIXED_LAYOUT.renditionPageSpreadCenter)
  ) {
    return BookPageSpreadRole.CENTER;
  }
  if (spreadNone) {
    return BookPageSpreadRole.SINGLE;
  }
  return 'auto';
}

function readViewport(xml: string): PageDimensions | null {
  const nameMatch: RegExpMatchArray | null = xml.match(VIEWPORT_NAME_PATTERN);
  const namedContent: string | undefined = nameMatch?.[1] ?? nameMatch?.[2];
  const named: PageDimensions | null =
    namedContent === undefined ? null : parseWidthHeight(namedContent);
  if (named !== null) {
    return named;
  }
  const renditionMatch: RegExpMatchArray | null = xml.match(RENDITION_VIEWPORT_BODY_PATTERN);
  if (renditionMatch?.[1] !== undefined) {
    const rendition: PageDimensions | null = parseWidthHeight(renditionMatch[1]);
    if (rendition !== null) {
      return rendition;
    }
  }
  const resolutionMatch: RegExpMatchArray | null = xml.match(ORIGINAL_RESOLUTION_PATTERN);
  if (resolutionMatch?.[1] !== undefined && resolutionMatch[2] !== undefined) {
    return {
      width: Number.parseInt(resolutionMatch[1], 10),
      height: Number.parseInt(resolutionMatch[2], 10),
    };
  }
  return null;
}

function parseWidthHeight(content: string): PageDimensions | null {
  const widthMatch: RegExpMatchArray | null = content.match(WIDTH_PATTERN);
  const heightMatch: RegExpMatchArray | null = content.match(HEIGHT_PATTERN);
  if (widthMatch?.[1] === undefined || heightMatch?.[1] === undefined) {
    return null;
  }
  return {
    width: Math.round(Number(widthMatch[1])),
    height: Math.round(Number(heightMatch[1])),
  };
}

function readRenditionSpread(packageXml: string): string {
  const bodyMatch: RegExpMatchArray | null = packageXml.match(RENDITION_SPREAD_BODY_PATTERN);
  if (bodyMatch?.[1] !== undefined) {
    return bodyMatch[1].trim().toLowerCase();
  }
  const contentMatch: RegExpMatchArray | null = packageXml.match(RENDITION_SPREAD_CONTENT_PATTERN);
  const contentValue: string | undefined = contentMatch?.[1] ?? contentMatch?.[2];
  return contentValue?.trim().toLowerCase() ?? '';
}

function readPageTitle(href: string, documentXml: string): string {
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
  const fileName: string = href.split('/').at(-1) ?? href;
  const dotIndex: number = fileName.lastIndexOf('.');
  return dotIndex <= 0 ? fileName : fileName.slice(0, dotIndex);
}

function stripMarkup(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
