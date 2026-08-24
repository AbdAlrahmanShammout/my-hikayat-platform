import { ApiError } from '@/api/api-error';

import { mapOpenReaderError } from './map-open-reader-error';

describe('mapOpenReaderError', () => {
  it('maps entitlement denial', () => {
    const actual = mapOpenReaderError(
      new ApiError({
        message: 'denied',
        code: 'FULL_BOOK_ACCESS_DENIED',
        statusCode: 403,
      }),
    );
    expect(actual.kind).toBe('entitlement_denied');
  });

  it('maps layout unavailable', () => {
    const actual = mapOpenReaderError(
      new ApiError({
        message: 'no layout',
        code: 'READER_LAYOUT_UNAVAILABLE',
        statusCode: 409,
      }),
    );
    expect(actual.kind).toBe('layout_unavailable');
  });
});
