import { BOOK_PROCESSING_JOB } from './book-processing-job.constant';

describe('BOOK_PROCESSING_JOB', () => {
  it('names the source-processing job', () => {
    expect(BOOK_PROCESSING_JOB.processSource).toBe('book.process-source');
  });
});
