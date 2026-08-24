import { unzipSync } from 'fflate';

export type FixedLayoutSpreadRole = 'left' | 'right' | 'center' | 'single';

export type ParsedFixedLayoutPage = {
  readonly spineIndex: number;
  readonly href: string;
  readonly title: string;
  readonly width: number;
  readonly height: number;
  readonly spreadRole: FixedLayoutSpreadRole;
  readonly htmlDocument: string;
};

export type ParsedFixedLayoutSpread = {
  readonly spreadIndex: number;
  readonly leftSpineIndex: number | null;
  readonly rightSpineIndex: number | null;
  readonly centerSpineIndex: number | null;
};

export type ParsedFixedLayoutEpub = {
  readonly pages: readonly ParsedFixedLayoutPage[];
  readonly spreads: readonly ParsedFixedLayoutSpread[];
};

type ManifestItem = {
  readonly id: string;
  readonly href: string;
  readonly mediaType: string;
};

type SpineItem = {
  readonly idref: string;
  readonly properties: string;
};

type ZipEntries = Record<string, Uint8Array>;

type PageDimensions = {
  readonly width: number;
  readonly height: number;
};

type SpreadBuilder = {
  pages: ParsedFixedLayoutPage[];
  spreads: ParsedFixedLayoutSpread[];
  pending: ParsedFixedLayoutPage | null;
};

const CONTAINER_PATH = 'META-INF/container.xml';
const MANIFEST_ITEM_PATTERN = /<item\b[^>]*\/?>/gi;
const ITEMREF_PATTERN = /<itemref\b[^>]*\/?>/gi;
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

/**
 * Parses a decrypted fixed-layout EPUB into pages and spreads for the canvas engine.
 */
export function parseFixedLayoutEpub(epubBytes: Uint8Array): ParsedFixedLayoutEpub {
  const entries: ZipEntries = normalizeZipEntries(unzipSync(epubBytes));
  const containerXml: string = readTextEntry(entries, CONTAINER_PATH);
  const packagePath: string = readRootfilePath(containerXml);
  const packageXml: string = readTextEntry(entries, packagePath);
  const packageDir: string = dirnamePath(packagePath);
  const manifestById: Map<string, ManifestItem> = parseManifest(packageXml);
  const packageViewport: PageDimensions | null = readViewport(packageXml);
  const spreadNone: boolean = readRenditionSpread(packageXml) === 'none';
  const stagedPages: {
    readonly page: ParsedFixedLayoutPage;
    readonly properties: string;
  }[] = [];
  for (const spineItem of parseSpineItems(packageXml)) {
    const item: ManifestItem | undefined = manifestById.get(spineItem.idref);
    if (item === undefined) {
      continue;
    }
    if (!item.mediaType.includes('html') && !item.mediaType.includes('xml')) {
      continue;
    }
    const href: string = resolveZipPath(packageDir, item.href);
    const documentXml: string = readTextEntry(entries, href);
    const viewport: PageDimensions | null = readViewport(documentXml) ?? packageViewport;
    if (viewport === null) {
      throw new Error(`Page viewport is missing for ${href}.`);
    }
    const withAssets: string = rewriteRelativeAssets({
      documentXml,
      chapterHref: href,
      entries,
    });
    stagedPages.push({
      properties: spineItem.properties,
      page: {
        spineIndex: stagedPages.length,
        href,
        title: resolvePageTitle(documentXml, href, stagedPages.length),
        width: viewport.width,
        height: viewport.height,
        spreadRole: 'single',
        htmlDocument: withAssets,
      },
    });
  }
  if (stagedPages.length === 0) {
    throw new Error('This book has no readable pages.');
  }
  return assignSpreads(stagedPages, spreadNone);
}

function assignSpreads(
  stagedPages: readonly {
    readonly page: ParsedFixedLayoutPage;
    readonly properties: string;
  }[],
  spreadNone: boolean,
): ParsedFixedLayoutEpub {
  const builder: SpreadBuilder = { pages: [], spreads: [], pending: null };
  for (const staged of stagedPages) {
    const role: FixedLayoutSpreadRole | 'auto' = readDeclaredRole(
      staged.properties,
      spreadNone,
    );
    applyDeclaredRole(builder, staged.page, role);
  }
  flushPending(builder);
  return { pages: builder.pages, spreads: builder.spreads };
}

function applyDeclaredRole(
  builder: SpreadBuilder,
  page: ParsedFixedLayoutPage,
  role: FixedLayoutSpreadRole | 'auto',
): void {
  if (role === 'center' || role === 'single') {
    flushPending(builder);
    pushSoloSpread(builder, withRole(page, role));
    return;
  }
  if (role === 'left') {
    flushPending(builder);
    builder.pending = withRole(page, 'left');
    return;
  }
  if (role === 'right') {
    if (builder.pending !== null) {
      pushPairSpread(builder, builder.pending, withRole(page, 'right'));
      builder.pending = null;
      return;
    }
    pushSoloSpread(builder, withRole(page, 'right'));
    return;
  }
  if (builder.pending !== null) {
    pushPairSpread(builder, builder.pending, withRole(page, 'right'));
    builder.pending = null;
    return;
  }
  builder.pending = withRole(page, 'left');
}

function flushPending(builder: SpreadBuilder): void {
  if (builder.pending === null) {
    return;
  }
  pushSoloSpread(builder, withRole(builder.pending, 'single'));
  builder.pending = null;
}

function pushSoloSpread(builder: SpreadBuilder, page: ParsedFixedLayoutPage): void {
  const spreadIndex: number = builder.spreads.length;
  builder.pages.push(page);
  builder.spreads.push({
    spreadIndex,
    leftSpineIndex: null,
    rightSpineIndex: page.spreadRole === 'right' ? page.spineIndex : null,
    centerSpineIndex: page.spreadRole === 'right' ? null : page.spineIndex,
  });
}

function pushPairSpread(
  builder: SpreadBuilder,
  leftPage: ParsedFixedLayoutPage,
  rightPage: ParsedFixedLayoutPage,
): void {
  const spreadIndex: number = builder.spreads.length;
  builder.pages.push(withRole(leftPage, 'left'));
  builder.pages.push(rightPage);
  builder.spreads.push({
    spreadIndex,
    leftSpineIndex: leftPage.spineIndex,
    rightSpineIndex: rightPage.spineIndex,
    centerSpineIndex: null,
  });
}

function withRole(
  page: ParsedFixedLayoutPage,
  spreadRole: FixedLayoutSpreadRole,
): ParsedFixedLayoutPage {
  return { ...page, spreadRole };
}

function readDeclaredRole(
  properties: string,
  spreadNone: boolean,
): FixedLayoutSpreadRole | 'auto' {
  const tokens: string[] = properties
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
  if (tokens.includes('page-spread-left') || tokens.includes('rendition:page-spread-left')) {
    return 'left';
  }
  if (tokens.includes('page-spread-right') || tokens.includes('rendition:page-spread-right')) {
    return 'right';
  }
  if (tokens.includes('page-spread-center') || tokens.includes('rendition:page-spread-center')) {
    return 'center';
  }
  if (spreadNone) {
    return 'single';
  }
  return 'auto';
}

function parseSpineItems(packageXml: string): SpineItem[] {
  const items: SpineItem[] = [];
  for (const tag of packageXml.match(ITEMREF_PATTERN) ?? []) {
    const linear: string | null = readAttribute(tag, 'linear');
    if (linear !== null && linear.toLowerCase() === 'no') {
      continue;
    }
    const idref: string | null = readAttribute(tag, 'idref');
    if (idref === null) {
      continue;
    }
    items.push({
      idref,
      properties: readAttribute(tag, 'properties') ?? '',
    });
  }
  return items;
}

function parseManifest(packageXml: string): Map<string, ManifestItem> {
  const items = new Map<string, ManifestItem>();
  for (const tag of packageXml.match(MANIFEST_ITEM_PATTERN) ?? []) {
    const id: string | null = readAttribute(tag, 'id');
    const href: string | null = readAttribute(tag, 'href');
    const mediaType: string | null = readAttribute(tag, 'media-type');
    if (id === null || href === null || mediaType === null) {
      continue;
    }
    items.set(id, { id, href, mediaType });
  }
  return items;
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
  if (resolutionMatch?.[1] !== undefined && resolutionMatch?.[2] !== undefined) {
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

function resolvePageTitle(documentXml: string, href: string, spineIndex: number): string {
  const heading: RegExpMatchArray | null = documentXml.match(HEADING_PATTERN);
  if (heading?.[1] !== undefined) {
    const title: string = stripTags(heading[1]).trim();
    if (title.length > 0) {
      return title;
    }
  }
  const documentTitle: RegExpMatchArray | null = documentXml.match(DOCUMENT_TITLE_PATTERN);
  if (documentTitle?.[1] !== undefined) {
    const title: string = stripTags(documentTitle[1]).trim();
    if (title.length > 0) {
      return title;
    }
  }
  const fileName: string = href.split('/').at(-1) ?? `page-${spineIndex + 1}`;
  return fileName;
}

function rewriteRelativeAssets(input: {
  readonly documentXml: string;
  readonly chapterHref: string;
  readonly entries: ZipEntries;
}): string {
  const chapterDir: string = dirnamePath(input.chapterHref);
  return input.documentXml.replace(
    /\b(src|href)\s*=\s*["']([^"']+)["']/gi,
    (full: string, attribute: string, rawTarget: string) => {
      const target: string = rawTarget.trim();
      if (
        target.length === 0 ||
        target.startsWith('#') ||
        target.startsWith('data:') ||
        /^[a-z][a-z0-9+.-]*:/i.test(target)
      ) {
        return full;
      }
      const assetPath: string = resolveZipPath(chapterDir, target.split('#')[0] ?? target);
      const bytes: Uint8Array | undefined = input.entries[assetPath];
      if (bytes === undefined) {
        return full;
      }
      if (attribute.toLowerCase() === 'href' && !isImagePath(assetPath)) {
        return full;
      }
      const mime: string = guessMimeType(assetPath);
      const dataUri: string = `data:${mime};base64,${bytesToBase64(bytes)}`;
      return `${attribute}="${dataUri}"`;
    },
  );
}

function normalizeZipEntries(raw: Record<string, Uint8Array>): ZipEntries {
  const entries: ZipEntries = {};
  for (const [name, bytes] of Object.entries(raw)) {
    entries[normalizeZipPath(name)] = bytes;
  }
  return entries;
}

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\.\//, '');
}

function readTextEntry(entries: ZipEntries, path: string): string {
  const bytes: Uint8Array | undefined = entries[normalizeZipPath(path)];
  if (bytes === undefined) {
    throw new Error(`Book file is missing ${path}.`);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

function readRootfilePath(containerXml: string): string {
  const match: RegExpMatchArray | null = containerXml.match(
    /full-path\s*=\s*["']([^"']+)["']/i,
  );
  if (match === null || match[1] === undefined || match[1].trim().length === 0) {
    throw new Error('Book package path is missing.');
  }
  return normalizeZipPath(match[1]);
}

function isImagePath(path: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(path);
}

function guessMimeType(path: string): string {
  const lower: string = path.toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (lower.endsWith('.gif')) {
    return 'image/gif';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  if (lower.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  if (lower.endsWith('.css')) {
    return 'text/css';
  }
  return 'application/octet-stream';
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index] ?? 0);
  }
  return globalThis.btoa(binary);
}

function dirnamePath(path: string): string {
  const normalized: string = normalizeZipPath(path);
  const slashIndex: number = normalized.lastIndexOf('/');
  if (slashIndex < 0) {
    return '';
  }
  return normalized.slice(0, slashIndex);
}

function resolveZipPath(baseDir: string, relativePath: string): string {
  const joined: string =
    baseDir.length === 0 ? relativePath : `${baseDir}/${relativePath}`;
  const parts: string[] = [];
  for (const part of normalizeZipPath(joined).split('/')) {
    if (part === '' || part === '.') {
      continue;
    }
    if (part === '..') {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join('/');
}

function readAttribute(tag: string, name: string): string | null {
  const match: RegExpMatchArray | null = tag.match(
    new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'),
  );
  if (match === null || match[1] === undefined) {
    return null;
  }
  return match[1];
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, '');
}
