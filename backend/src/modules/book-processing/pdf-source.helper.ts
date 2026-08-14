import { BookProcessingInvalidPdfException } from '@/modules/book-processing/exceptions/book-processing-invalid-pdf.exception';
import { PDF_SOURCE } from '@/modules/book-processing/pdf-source.constant';

export class PdfSourceHelper {
  static validate(bytes: Buffer): void {
    const header: Buffer = Buffer.from(PDF_SOURCE.header);
    if (bytes.length < header.length || !bytes.subarray(0, header.length).equals(header)) {
      throw new BookProcessingInvalidPdfException('file does not start with a PDF header');
    }
  }
}
