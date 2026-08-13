import { HttpException, HttpStatus } from '@nestjs/common';

import { AppException } from '@/common/exceptions/app.exception';
import { ValidationExceptions } from '@/common/exceptions/validation.exception';
import { mapErrorKindToHttpStatus } from '@/common/filter/exception_return_handler/http_exception.handler';
import { GeneralTypeException } from '@/common/filter/exception_return_handler/type/general-type.exception';

function tryMapSpecialExceptions(_exception: unknown): GeneralTypeException | null {
  return null;
}

function fromAppException(exception: AppException): GeneralTypeException {
  return new GeneralTypeException({
    message: exception.message,
    code: exception.code,
    statusCode: mapErrorKindToHttpStatus(exception.kind),
    userFriendly: exception.userFriendly,
    stack: exception.stack,
    validationErrorObjects:
      exception instanceof ValidationExceptions ? exception.validationErrorObjects : undefined,
  });
}

function resolveHttpExceptionMessage(exception: HttpException): string {
  const response: string | object = exception.getResponse();
  if (typeof response === 'string') {
    return response;
  }
  if (typeof response === 'object' && response !== null && 'message' in response) {
    const message: unknown = response.message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message)) {
      return message.join(', ');
    }
  }
  return exception.message;
}

function fromHttpException(exception: HttpException): GeneralTypeException {
  const statusCode: number = exception.getStatus();
  return new GeneralTypeException({
    message: resolveHttpExceptionMessage(exception),
    code: 'HTTP_EXCEPTION',
    statusCode,
    userFriendly: statusCode < Number(HttpStatus.INTERNAL_SERVER_ERROR),
    stack: exception.stack,
  });
}

export function normalizeException(exception: unknown): GeneralTypeException {
  const mapped: GeneralTypeException | null = tryMapSpecialExceptions(exception);
  if (mapped) {
    return mapped;
  }
  if (exception instanceof AppException) {
    return fromAppException(exception);
  }
  if (exception instanceof HttpException) {
    return fromHttpException(exception);
  }
  return new GeneralTypeException({
    message: exception instanceof Error ? exception.message : 'Unknown Error',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    userFriendly: false,
    stack: exception instanceof Error ? exception.stack : undefined,
  });
}
