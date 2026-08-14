import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { EPUB_LAYOUT } from '@/modules/book-processing/epub-layout.constant';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';

const RENDITION_LAYOUT_BODY_PATTERN =
  /<meta\b[^>]*\bproperty\s*=\s*["']rendition:layout["'][^>]*>([\s\S]*?)<\/meta>/i;
const RENDITION_LAYOUT_CONTENT_PATTERN =
  /<meta\b[^>]*(?:property\s*=\s*["']rendition:layout["'][^>]*content\s*=\s*["']([^"']+)["']|content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']rendition:layout["'])[^>]*\/?>/i;
const RENDITION_LAYOUT_NAME_PATTERN =
  /<meta\b[^>]*(?:name\s*=\s*["']rendition:layout["'][^>]*content\s*=\s*["']([^"']+)["']|content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']rendition:layout["'])[^>]*\/?>/i;
const FIXED_LAYOUT_NAME_PATTERN =
  /<meta\b[^>]*(?:name\s*=\s*["']fixed-layout["'][^>]*content\s*=\s*["']([^"']+)["']|content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']fixed-layout["'])[^>]*\/?>/i;
const APPLE_FIXED_LAYOUT_PATTERN =
  /<option\b[^>]*\bname\s*=\s*["']fixed-layout["'][^>]*>([\s\S]*?)<\/option>/i;

export class EpubLayoutHelper {
  static detect(packageXml: string, archive: ZipArchive): BookLayoutType {
    const renditionLayout: string | null = EpubLayoutHelper.readRenditionLayout(packageXml);
    if (renditionLayout === EPUB_LAYOUT.prePaginated) {
      return BookLayoutType.FIXED_LAYOUT;
    }
    if (renditionLayout === EPUB_LAYOUT.reflowable) {
      return BookLayoutType.REFLOWABLE;
    }
    if (EpubLayoutHelper.hasLegacyFixedLayoutMeta(packageXml)) {
      return BookLayoutType.FIXED_LAYOUT;
    }
    if (EpubLayoutHelper.hasAppleFixedLayout(archive)) {
      return BookLayoutType.FIXED_LAYOUT;
    }
    return BookLayoutType.REFLOWABLE;
  }

  private static readRenditionLayout(packageXml: string): string | null {
    const bodyMatch: RegExpMatchArray | null = packageXml.match(RENDITION_LAYOUT_BODY_PATTERN);
    const bodyToken: string | null = normalizeOptionalToken(bodyMatch?.[1]);
    if (isKnownRenditionLayout(bodyToken)) {
      return bodyToken;
    }
    const contentMatch: RegExpMatchArray | null = packageXml.match(
      RENDITION_LAYOUT_CONTENT_PATTERN,
    );
    const contentToken: string | null = normalizeOptionalToken(
      contentMatch?.[1] ?? contentMatch?.[2],
    );
    if (isKnownRenditionLayout(contentToken)) {
      return contentToken;
    }
    const nameMatch: RegExpMatchArray | null = packageXml.match(RENDITION_LAYOUT_NAME_PATTERN);
    const nameToken: string | null = normalizeOptionalToken(nameMatch?.[1] ?? nameMatch?.[2]);
    if (isKnownRenditionLayout(nameToken)) {
      return nameToken;
    }
    return null;
  }

  private static hasLegacyFixedLayoutMeta(packageXml: string): boolean {
    const match: RegExpMatchArray | null = packageXml.match(FIXED_LAYOUT_NAME_PATTERN);
    const value: string | undefined = match?.[1] ?? match?.[2];
    return value !== undefined && normalizeLayoutToken(value) === 'true';
  }

  private static hasAppleFixedLayout(archive: ZipArchive): boolean {
    if (!archive.has(EPUB_LAYOUT.appleDisplayOptionsPath)) {
      return false;
    }
    const displayOptions: string = archive
      .read(EPUB_LAYOUT.appleDisplayOptionsPath)
      .toString('utf8');
    const match: RegExpMatchArray | null = displayOptions.match(APPLE_FIXED_LAYOUT_PATTERN);
    if (match?.[1] === undefined) {
      return false;
    }
    return normalizeLayoutToken(match[1]) === 'true';
  }
}

function normalizeLayoutToken(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function normalizeOptionalToken(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }
  return normalizeLayoutToken(value);
}

function isKnownRenditionLayout(value: string | null): value is string {
  return value === EPUB_LAYOUT.prePaginated || value === EPUB_LAYOUT.reflowable;
}
