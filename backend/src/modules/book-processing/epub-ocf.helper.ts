import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';

const ROOTFILE_TAG_PATTERN = /<rootfile\b[^>]*>/i;
const FULL_PATH_PATTERN = /full-path\s*=\s*["']([^"']+)["']/i;
const MEDIA_TYPE_PATTERN = /media-type\s*=\s*["']([^"']+)["']/i;
const PACKAGE_ELEMENT_PATTERN = /<package\b/i;

export class EpubOcfHelper {
  static validate(bytes: Buffer): void {
    const archive: ZipArchive = EpubOcfHelper.openArchive(bytes);
    EpubOcfHelper.assertMimetypeEntry(archive);
    const packagePath: string = EpubOcfHelper.readPackagePath(archive);
    EpubOcfHelper.assertPackageDocument(archive, packagePath);
  }

  private static openArchive(bytes: Buffer): ZipArchive {
    try {
      return ZipArchive.fromBuffer(bytes);
    } catch {
      throw new BookProcessingInvalidEpubException('file is not a ZIP archive');
    }
  }

  private static assertMimetypeEntry(archive: ZipArchive): void {
    if (archive.firstEntryName !== EPUB_OCF.mimetypePath) {
      throw new BookProcessingInvalidEpubException('mimetype must be the first ZIP entry');
    }
    if (!archive.isFirstEntryStoredWithoutExtra) {
      throw new BookProcessingInvalidEpubException('mimetype must be stored uncompressed');
    }
    const mimetype: string = archive.read(EPUB_OCF.mimetypePath).toString('utf8');
    if (mimetype !== EPUB_OCF.mimetypeValue) {
      throw new BookProcessingInvalidEpubException('mimetype must be application/epub+zip');
    }
  }

  private static readPackagePath(archive: ZipArchive): string {
    if (!archive.has(EPUB_OCF.containerPath)) {
      throw new BookProcessingInvalidEpubException('META-INF/container.xml is missing');
    }
    const containerXml: string = archive.read(EPUB_OCF.containerPath).toString('utf8');
    const rootfileTag: RegExpMatchArray | null = containerXml.match(ROOTFILE_TAG_PATTERN);
    if (rootfileTag === null) {
      throw new BookProcessingInvalidEpubException('container.xml has no rootfile');
    }
    const fullPathMatch: RegExpMatchArray | null = rootfileTag[0].match(FULL_PATH_PATTERN);
    const mediaTypeMatch: RegExpMatchArray | null = rootfileTag[0].match(MEDIA_TYPE_PATTERN);
    if (fullPathMatch === null || mediaTypeMatch === null) {
      throw new BookProcessingInvalidEpubException('container.xml rootfile is incomplete');
    }
    if (mediaTypeMatch[1].toLowerCase() !== EPUB_OCF.packageMediaType) {
      throw new BookProcessingInvalidEpubException('rootfile media-type must be the OPF package');
    }
    return fullPathMatch[1];
  }

  private static assertPackageDocument(archive: ZipArchive, packagePath: string): void {
    if (!archive.has(packagePath)) {
      throw new BookProcessingInvalidEpubException('OPF package document is missing');
    }
    const packageXml: string = archive.read(packagePath).toString('utf8');
    if (!PACKAGE_ELEMENT_PATTERN.test(packageXml)) {
      throw new BookProcessingInvalidEpubException('OPF package document is malformed');
    }
  }
}
