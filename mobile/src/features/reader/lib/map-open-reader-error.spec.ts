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
    expect(actual.message).toContain('Subscribe on Profile');
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

  it('maps a missing offline package', () => {
    const actual = mapOpenReaderError(
      new ApiError({
        message: 'missing package',
        code: 'OFFLINE_PACKAGE_MISSING',
        statusCode: 404,
      }),
    );
    expect(actual.kind).toBe('not_found');
    expect(actual.message).toContain('not downloaded for offline reading');
  });
});
