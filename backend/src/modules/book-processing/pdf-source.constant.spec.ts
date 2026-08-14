import { PDF_SOURCE } from './pdf-source.constant';

describe('PDF_SOURCE', () => {
  it('uses the PDF header and content type', () => {
    expect(PDF_SOURCE.header).toBe('%PDF-');
    expect(PDF_SOURCE.contentType).toBe('application/pdf');
  });
});
