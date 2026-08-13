import { HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { Response } from 'express';

import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { ValidationErrorObject } from '@/common/exceptions/validation-error-object.type';
import { GeneralTypeException } from '@/common/filter/exception_return_handler/type/general-type.exception';

export type HttpExceptionResponseBody = {
  message: string;
  code: string;
  statusCode: number;
  stack?: string;
  validationErrorObjects?: ValidationErrorObject[];
};

const ERROR_KIND_HTTP_STATUS: Record<ErrorKind, HttpStatus> = {
  [ErrorKind.VALIDATION]: HttpStatus.UNPROCESSABLE_ENTITY,
  [ErrorKind.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorKind.CONFLICT]: HttpStatus.CONFLICT,
  [ErrorKind.INVALID_STATE]: HttpStatus.BAD_REQUEST,
  [ErrorKind.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [ErrorKind.ACCESS_DENIED]: HttpStatus.FORBIDDEN,
  [ErrorKind.DEPENDENCY_FAILURE]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorKind.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
};

export function mapErrorKindToHttpStatus(kind: ErrorKind): HttpStatus {
  return ERROR_KIND_HTTP_STATUS[kind];
}

export function handleHttpException(normalized: GeneralTypeException, host: ArgumentsHost): void {
  const response: Response = host.switchToHttp().getResponse<Response>();
  const body: HttpExceptionResponseBody = {
    message: normalized.message,
    code: normalized.code,
    statusCode: normalized.statusCode,
  };
  if (normalized.stack !== undefined) {
    body.stack = normalized.stack;
  }
  if (normalized.validationErrorObjects !== undefined) {
    body.validationErrorObjects = normalized.validationErrorObjects;
  }
  response.status(normalized.statusCode).json(body);
}
