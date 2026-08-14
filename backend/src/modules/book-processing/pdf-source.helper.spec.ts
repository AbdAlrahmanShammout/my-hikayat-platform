import { EPUB_OCF } from '@/modules/book-processing/epub-ocf.constant';
import { BookProcessingInvalidPdfException } from '@/modules/book-processing/exceptions/book-processing-invalid-pdf.exception';
import { ZipArchive } from '@/modules/book-processing/zip-archive.helper';

import { PdfSourceHelper } from './pdf-source.helper';

describe('PdfSourceHelper', () => {
  it('accepts a PDF header', () => {
    expect(() => PdfSourceHelper.validate(Buffer.from('%PDF-1.7\n1 0 obj'))).not.toThrow();
  });

  it('rejects a payload without a PDF header', () => {
    expect(() => PdfSourceHelper.validate(Buffer.from('not a pdf'))).toThrow(
      BookProcessingInvalidPdfException,
    );
  });

  it('rejects an EPUB ZIP payload', () => {
    const epubBytes = ZipArchive.createStored([
      { name: EPUB_OCF.mimetypePath, data: Buffer.from(EPUB_OCF.mimetypeValue) },
    ]);
    expect(() => PdfSourceHelper.validate(epubBytes)).toThrow(BookProcessingInvalidPdfException);
  });
});
