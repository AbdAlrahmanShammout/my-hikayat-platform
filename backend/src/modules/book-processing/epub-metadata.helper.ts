import { ExtractedEpubMetadata } from '@/modules/book-processing/defs/book-processing-service.defs';
import { BookProcessingInvalidEpubException } from '@/modules/book-processing/exceptions/book-processing-invalid-epub.exception';

const PACKAGE_TAG_PATTERN = /<package\b[^>]*>/i;
const DC_TITLE_PATTERN = /<dc:title\b[^>]*>([\s\S]*?)<\/dc:title>/i;
const DC_LANGUAGE_PATTERN = /<dc:language\b[^>]*>([\s\S]*?)<\/dc:language>/i;
const DC_IDENTIFIER_PATTERN = /<dc:identifier\b[^>]*>([\s\S]*?)<\/dc:identifier>/i;
const DC_CREATOR_PATTERN = /<dc:creator\b[^>]*>([\s\S]*?)<\/dc:creator>/i;
const DC_PUBLISHER_PATTERN = /<dc:publisher\b[^>]*>([\s\S]*?)<\/dc:publisher>/i;
const DC_DESCRIPTION_PATTERN = /<dc:description\b[^>]*>([\s\S]*?)<\/dc:description>/i;

export class EpubMetadataHelper {
  static extract(packageXml: string, packagePath: string): ExtractedEpubMetadata {
    const epubVersion: string = EpubMetadataHelper.readRequiredAttribute(packageXml, 'version');
    const title: string = EpubMetadataHelper.readRequiredElement(
      packageXml,
      DC_TITLE_PATTERN,
      'title',
    );
    const language: string = EpubMetadataHelper.readRequiredElement(
      packageXml,
      DC_LANGUAGE_PATTERN,
      'language',
    );
    const identifier: string = EpubMetadataHelper.readIdentifier(packageXml);
    return {
      packagePath,
      epubVersion,
      identifier,
      title,
      language,
      creator: EpubMetadataHelper.readOptionalElement(packageXml, DC_CREATOR_PATTERN),
      publisher: EpubMetadataHelper.readOptionalElement(packageXml, DC_PUBLISHER_PATTERN),
      description: EpubMetadataHelper.readOptionalElement(packageXml, DC_DESCRIPTION_PATTERN),
    };
  }

  private static readIdentifier(packageXml: string): string {
    const uniqueId: string | null = EpubMetadataHelper.readOptionalAttribute(
      packageXml,
      'unique-identifier',
    );
    if (uniqueId !== null) {
      const uniquePattern = new RegExp(
        `<dc:identifier\\b[^>]*\\bid\\s*=\\s*["']${escapeRegExp(uniqueId)}["'][^>]*>([\\s\\S]*?)</dc:identifier>`,
        'i',
      );
      const uniqueMatch: string | null = EpubMetadataHelper.readOptionalElement(
        packageXml,
        uniquePattern,
      );
      if (uniqueMatch !== null) {
        return uniqueMatch;
      }
    }
    return EpubMetadataHelper.readRequiredElement(packageXml, DC_IDENTIFIER_PATTERN, 'identifier');
  }

  private static readRequiredAttribute(packageXml: string, name: string): string {
    const value: string | null = EpubMetadataHelper.readOptionalAttribute(packageXml, name);
    if (value === null) {
      throw new BookProcessingInvalidEpubException(`OPF package ${name} is missing`);
    }
    return value;
  }

  private static readOptionalAttribute(packageXml: string, name: string): string | null {
    const packageTag: RegExpMatchArray | null = packageXml.match(PACKAGE_TAG_PATTERN);
    if (packageTag === null) {
      return null;
    }
    const attributePattern = new RegExp(`${escapeRegExp(name)}\\s*=\\s*["']([^"']+)["']`, 'i');
    const match: RegExpMatchArray | null = packageTag[0].match(attributePattern);
    if (match === null || match[1] === undefined) {
      return null;
    }
    return decodeXmlText(match[1]);
  }

  private static readRequiredElement(
    packageXml: string,
    pattern: RegExp,
    fieldName: string,
  ): string {
    const value: string | null = EpubMetadataHelper.readOptionalElement(packageXml, pattern);
    if (value === null) {
      throw new BookProcessingInvalidEpubException(`OPF ${fieldName} is missing`);
    }
    return value;
  }

  private static readOptionalElement(packageXml: string, pattern: RegExp): string | null {
    const match: RegExpMatchArray | null = packageXml.match(pattern);
    if (match === null || match[1] === undefined) {
      return null;
    }
    const decoded: string = decodeXmlText(match[1]);
    if (decoded.length === 0) {
      return null;
    }
    return decoded;
  }
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
