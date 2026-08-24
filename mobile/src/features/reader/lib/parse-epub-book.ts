import { unzipSync } from 'fflate';

export type ParsedEpubChapter = {
  readonly spineIndex: number;
  readonly href: string;
  readonly title: string;
  readonly htmlDocument: string;
};

export type ParsedEpubBook = {
  readonly chapters: readonly ParsedEpubChapter[];
};

type ManifestItem = {
  readonly id: string;
  readonly href: string;
  readonly mediaType: string;
};

type ZipEntries = Record<string, Uint8Array>;

const CONTAINER_PATH = 'META-INF/container.xml';
const MANIFEST_ITEM_PATTERN = /<item\b[^>]*\/?>/gi;
const ITEMREF_PATTERN = /<itemref\b[^>]*\/?>/gi;
const HEADING_PATTERN = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i;
const DOCUMENT_TITLE_PATTERN = /<title\b[^>]*>([\s\S]*?)<\/title>/i;

/**
 * Parses a decrypted EPUB ZIP into linear spine chapters for the reflowable engine.
 */
export function parseEpubBook(epubBytes: Uint8Array): ParsedEpubBook {
  const entries: ZipEntries = normalizeZipEntries(unzipSync(epubBytes));
  const containerXml: string = readTextEntry(entries, CONTAINER_PATH);
  const packagePath: string = readRootfilePath(containerXml);
  const packageXml: string = readTextEntry(entries, packagePath);
  const packageDir: string = dirnamePath(packagePath);
  const manifestById: Map<string, ManifestItem> = parseManifest(packageXml);
  const chapters: ParsedEpubChapter[] = [];
  for (const idref of parseSpineIdrefs(packageXml)) {
    const item: ManifestItem | undefined = manifestById.get(idref);
    if (item === undefined) {
      continue;
    }
    if (!item.mediaType.includes('html') && !item.mediaType.includes('xml')) {
      continue;
    }
    const href: string = resolveZipPath(packageDir, item.href);
    const documentXml: string = readTextEntry(entries, href);
    const withAssets: string = rewriteRelativeAssets({
      documentXml,
      chapterHref: href,
      entries,
    });
    chapters.push({
      spineIndex: chapters.length,
      href,
      title: resolveChapterTitle(documentXml, chapters.length),
      htmlDocument: withAssets,
    });
  }
  if (chapters.length === 0) {
    throw new Error('This book has no readable chapters.');
  }
  return { chapters };
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

function parseSpineIdrefs(packageXml: string): string[] {
  const idrefs: string[] = [];
  for (const tag of packageXml.match(ITEMREF_PATTERN) ?? []) {
    const linear: string | null = readAttribute(tag, 'linear');
    if (linear !== null && linear.toLowerCase() === 'no') {
      continue;
    }
    const idref: string | null = readAttribute(tag, 'idref');
    if (idref !== null) {
      idrefs.push(idref);
    }
  }
  return idrefs;
}

function resolveChapterTitle(documentXml: string, spineIndex: number): string {
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
  return `Chapter ${spineIndex + 1}`;
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
