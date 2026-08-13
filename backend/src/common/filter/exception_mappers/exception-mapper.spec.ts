import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { ValidationExceptions } from '@/common/exceptions/validation.exception';
import { normalizeException } from '@/common/filter/exception_mappers/exception-mapper';
import { mapErrorKindToHttpStatus } from '@/common/filter/exception_return_handler/http_exception.handler';

describe('normalizeException', () => {
  it('maps an AppException kind to the HTTP status table', () => {
    const exception = new ResourceNotFoundException('Book', 12);
    const actualResult = normalizeException(exception);
    expect(actualResult.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(actualResult.code).toBe('RESOURCE_NOT_FOUND');
    expect(actualResult.userFriendly).toBe(true);
    expect(actualResult.message).toContain('Book');
  });

  it('includes validationErrorObjects for ValidationExceptions', () => {
    const exception = new ValidationExceptions({
      message: 'Invalid input',
      validationErrorObjects: [
        { property: 'title', constraints: { isString: 'title must be a string' } },
      ],
    });
    const actualResult = normalizeException(exception);
    expect(actualResult.statusCode).toBe(mapErrorKindToHttpStatus(ErrorKind.VALIDATION));
    expect(actualResult.validationErrorObjects).toHaveLength(1);
  });

  it('maps a framework HttpException without treating it as a domain throw', () => {
    const exception = new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    const actualResult = normalizeException(exception);
    expect(actualResult.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(actualResult.code).toBe('HTTP_EXCEPTION');
  });

  it('maps a payload-too-large parser error to 413', () => {
    const exception = Object.assign(new Error('request entity too large'), {
      type: 'entity.too.large',
      status: HttpStatus.PAYLOAD_TOO_LARGE,
    });
    const actualResult = normalizeException(exception);
    expect(actualResult.statusCode).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(actualResult.code).toBe('PAYLOAD_TOO_LARGE');
    expect(actualResult.userFriendly).toBe(true);
  });

  it('maps TypeError to an internal 500 that is not user-friendly', () => {
    const exception = new TypeError('Cannot read properties of undefined');
    const actualResult = normalizeException(exception);
    expect(actualResult.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(actualResult.userFriendly).toBe(false);
    expect(actualResult.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
