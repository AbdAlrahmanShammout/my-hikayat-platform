import { BOOK_PROCESSING_TRANSITIONS } from './book-processing-transitions';
import { BookProcessingStatus } from './enum/general.enum';

describe('BOOK_PROCESSING_TRANSITIONS', () => {
  it('allows ingest to start only from not_started', () => {
    expect(BOOK_PROCESSING_TRANSITIONS[BookProcessingStatus.NOT_STARTED]).toEqual([
      BookProcessingStatus.PROCESSING,
    ]);
  });

  it('allows processing to finish as ready or failed', () => {
    expect(BOOK_PROCESSING_TRANSITIONS[BookProcessingStatus.PROCESSING]).toEqual([
      BookProcessingStatus.READY,
      BookProcessingStatus.FAILED,
    ]);
  });

  it('allows a completed or failed book to be reprocessed or reset', () => {
    expect(BOOK_PROCESSING_TRANSITIONS[BookProcessingStatus.READY]).toEqual([
      BookProcessingStatus.PROCESSING,
      BookProcessingStatus.NOT_STARTED,
    ]);
    expect(BOOK_PROCESSING_TRANSITIONS[BookProcessingStatus.FAILED]).toEqual([
      BookProcessingStatus.PROCESSING,
      BookProcessingStatus.NOT_STARTED,
    ]);
  });
});
