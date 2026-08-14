import {
  ExtractedEpubPageTextLayer,
  ExtractedEpubTextRun,
} from '@/modules/book-processing/defs/book-processing-service.defs';
import { EPUB_FIXED_LAYOUT_TEXT } from '@/modules/book-processing/epub-fixed-layout-text.constant';
import { EpubFixedLayoutHelper } from '@/modules/book-processing/epub-fixed-layout.helper';
import { EpubOcfOpenedPackage } from '@/modules/book-processing/epub-ocf.helper';
import { EpubLinearDocument, EpubSpineHelper } from '@/modules/book-processing/epub-spine.helper';

const SVG_TEXT_PATTERN = /<text\b([^>]*)>([\s\S]*?)<\/text>/gi;
const TSPAN_PATTERN = /<tspan\b([^>]*)>([\s\S]*?)<\/tspan>/gi;
const POSITIONED_TAG_PATTERN =
  /<([a-zA-Z][\w:-]*)\b([^>]*\bstyle\s*=\s*["'][^"']*["'][^>]*)>([\s\S]*?)<\/\1>/gi;
const STYLE_ATTRIBUTE_PATTERN = /\bstyle\s*=\s*["']([^"']+)["']/i;
const LENGTH_PATTERN = /^(-?\d+(?:\.\d+)?)(px|%)?$/i;
const SKIP_POSITIONED_TAGS = new Set(['text', 'tspan', 'script', 'style', 'head']);

type PageViewport = {
  readonly width: number;
  readonly height: number;
};

type ParsedLength = {
  readonly value: number;
  readonly unit: 'px' | '%';
};

type PositionedBox = {
  readonly x: number;
  readonly y: number;
  readonly width: number | null;
  readonly height: number | null;
};

export class EpubFixedLayoutTextHelper {
  static extract(opened: EpubOcfOpenedPackage): ExtractedEpubPageTextLayer[] {
    const packageViewport: PageViewport | null = EpubFixedLayoutHelper.readViewport(
      opened.packageXml,
    );
    return EpubSpineHelper.listLinearDocuments(opened).map((document) =>
      toExtractedLayer(document, packageViewport),
    );
  }
}

function toExtractedLayer(
  document: EpubLinearDocument,
  packageViewport: PageViewport | null,
): ExtractedEpubPageTextLayer {
  const viewport: PageViewport = resolveViewport(document.documentXml, packageViewport);
  return {
    spineIndex: document.spineIndex,
    href: document.href,
    contentText: stripMarkup(document.documentXml),
    runs: collectRuns(document.documentXml, viewport),
  };
}

function collectRuns(documentXml: string, viewport: PageViewport): ExtractedEpubTextRun[] {
  const runs: ExtractedEpubTextRun[] = [];
  appendSvgRuns(runs, documentXml, viewport);
  appendHtmlRuns(runs, documentXml, viewport);
  return runs;
}

function appendSvgRuns(
  runs: ExtractedEpubTextRun[],
  documentXml: string,
  viewport: PageViewport,
): void {
  for (const match of documentXml.matchAll(new RegExp(SVG_TEXT_PATTERN.source, 'gi'))) {
    const openTag: string = match[1] ?? '';
    const innerXml: string = match[2] ?? '';
    pushSvgTextRuns(runs, openTag, innerXml, viewport);
  }
}

function pushSvgTextRuns(
  runs: ExtractedEpubTextRun[],
  openTag: string,
  innerXml: string,
  viewport: PageViewport,
): void {
  const tspanMatches: RegExpMatchArray[] = [
    ...innerXml.matchAll(new RegExp(TSPAN_PATTERN.source, 'gi')),
  ];
  const positionedTspans: RegExpMatchArray[] = tspanMatches.filter((match) => {
    return readSvgBox(match[1] ?? '', viewport) !== null;
  });
  if (positionedTspans.length > 0) {
    positionedTspans.forEach((match) => {
      pushRun(runs, match[2] ?? '', readSvgBox(match[1] ?? '', viewport));
    });
    return;
  }
  pushRun(runs, innerXml, readSvgBox(openTag, viewport));
}

function appendHtmlRuns(
  runs: ExtractedEpubTextRun[],
  documentXml: string,
  viewport: PageViewport,
): void {
  for (const match of documentXml.matchAll(new RegExp(POSITIONED_TAG_PATTERN.source, 'gi'))) {
    const tagName: string = (match[1] ?? '').toLowerCase();
    if (SKIP_POSITIONED_TAGS.has(tagName)) {
      continue;
    }
    const openTag: string = match[2] ?? '';
    const innerXml: string = match[3] ?? '';
    pushRun(runs, innerXml, readHtmlBox(openTag, viewport));
  }
}

function pushRun(runs: ExtractedEpubTextRun[], innerXml: string, box: PositionedBox | null): void {
  if (box === null) {
    return;
  }
  const text: string = stripMarkup(innerXml);
  if (text.length === 0) {
    return;
  }
  runs.push({
    sortOrder: runs.length,
    text,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
  });
}

function readSvgBox(openTag: string, viewport: PageViewport): PositionedBox | null {
  const x: ParsedLength | null = parseLength(readAttribute(openTag, 'x'));
  const y: ParsedLength | null = parseLength(readAttribute(openTag, 'y'));
  if (x === null || y === null) {
    return null;
  }
  return {
    x: convertLength(x, viewport.width),
    y: convertLength(y, viewport.height),
    width: convertOptionalLength(parseLength(readAttribute(openTag, 'width')), viewport.width),
    height: convertOptionalLength(parseLength(readAttribute(openTag, 'height')), viewport.height),
  };
}

function readHtmlBox(openTag: string, viewport: PageViewport): PositionedBox | null {
  const styleMatch: RegExpMatchArray | null = openTag.match(STYLE_ATTRIBUTE_PATTERN);
  if (styleMatch?.[1] === undefined) {
    return null;
  }
  const styles: Map<string, string> = parseStyleDeclarations(styleMatch[1]);
  const left: ParsedLength | null = parseLength(styles.get('left') ?? null);
  const top: ParsedLength | null = parseLength(styles.get('top') ?? null);
  if (left === null || top === null) {
    return null;
  }
  return {
    x: convertLength(left, viewport.width),
    y: convertLength(top, viewport.height),
    width: convertOptionalLength(parseLength(styles.get('width') ?? null), viewport.width),
    height: convertOptionalLength(parseLength(styles.get('height') ?? null), viewport.height),
  };
}

function parseStyleDeclarations(style: string): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const part of style.split(';')) {
    const separator: number = part.indexOf(':');
    if (separator <= 0) {
      continue;
    }
    const name: string = part.slice(0, separator).trim().toLowerCase();
    const value: string = part.slice(separator + 1).trim();
    if (name.length === 0 || value.length === 0) {
      continue;
    }
    declarations.set(name, value);
  }
  return declarations;
}

function parseLength(raw: string | null): ParsedLength | null {
  if (raw === null) {
    return null;
  }
  const match: RegExpMatchArray | null = raw.trim().split(/\s+/)[0]?.match(LENGTH_PATTERN) ?? null;
  if (match?.[1] === undefined) {
    return null;
  }
  const unit: string = (match[2] ?? 'px').toLowerCase();
  if (unit !== 'px' && unit !== '%') {
    return null;
  }
  return { value: Number(match[1]), unit };
}

function convertLength(length: ParsedLength, axisSize: number): number {
  if (length.unit === '%') {
    return (length.value / 100) * axisSize;
  }
  return length.value;
}

function convertOptionalLength(length: ParsedLength | null, axisSize: number): number | null {
  if (length === null) {
    return null;
  }
  return convertLength(length, axisSize);
}

function resolveViewport(documentXml: string, packageViewport: PageViewport | null): PageViewport {
  return (
    EpubFixedLayoutHelper.readViewport(documentXml) ??
    packageViewport ?? {
      width: EPUB_FIXED_LAYOUT_TEXT.percentFallbackWidth,
      height: EPUB_FIXED_LAYOUT_TEXT.percentFallbackHeight,
    }
  );
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
