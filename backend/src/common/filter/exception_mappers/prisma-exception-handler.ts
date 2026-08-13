import { Prisma } from '@prisma/client';

import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { mapErrorKindToHttpStatus } from '@/common/filter/exception_return_handler/http_exception.handler';
import { GeneralTypeException } from '@/common/filter/exception_return_handler/type/general-type.exception';

const UNIQUE_VIOLATION_CODE = 'P2002';
const RECORD_NOT_FOUND_CODE = 'P2025';
const FOREIGN_KEY_VIOLATION_CODE = 'P2003';
const REQUIRED_RELATION_VIOLATION_CODE = 'P2014';
const TABLE_DOES_NOT_EXIST_CODE = 'P2021';
const COLUMN_DOES_NOT_EXIST_CODE = 'P2022';
const CONNECTION_POOL_TIMEOUT_CODE = 'P2024';
const TRANSACTION_TIMEOUT_CODE = 'P2028';

function createTimestampedMessage(prefix: string, exception: Error, driverCode?: string): string {
  const codePart: string = driverCode === undefined ? '' : ` code=${driverCode}`;
  return `${new Date().toISOString()} ${prefix}${codePart}: ${exception.message}`;
}

function mapKnownRequestError(
  exception: Prisma.PrismaClientKnownRequestError,
): GeneralTypeException {
  switch (exception.code) {
    case UNIQUE_VIOLATION_CODE:
      return new GeneralTypeException({
        message: 'Resource already exists',
        code: 'RESOURCE_CONFLICT',
        statusCode: mapErrorKindToHttpStatus(ErrorKind.CONFLICT),
        userFriendly: true,
      });
    case RECORD_NOT_FOUND_CODE:
      return new GeneralTypeException({
        message: 'Resource was not found',
        code: 'RESOURCE_NOT_FOUND',
        statusCode: mapErrorKindToHttpStatus(ErrorKind.NOT_FOUND),
        userFriendly: true,
      });
    case FOREIGN_KEY_VIOLATION_CODE:
    case REQUIRED_RELATION_VIOLATION_CODE:
      return new GeneralTypeException({
        message: 'Related resource is in an invalid state',
        code: 'INVALID_STATE',
        statusCode: mapErrorKindToHttpStatus(ErrorKind.INVALID_STATE),
        userFriendly: true,
      });
    case CONNECTION_POOL_TIMEOUT_CODE:
    case TRANSACTION_TIMEOUT_CODE:
      return new GeneralTypeException({
        message: createTimestampedMessage('Database timeout', exception, exception.code),
        code: 'DEPENDENCY_FAILURE',
        statusCode: mapErrorKindToHttpStatus(ErrorKind.DEPENDENCY_FAILURE),
        userFriendly: false,
        stack: exception.stack,
      });
    case TABLE_DOES_NOT_EXIST_CODE:
    case COLUMN_DOES_NOT_EXIST_CODE:
    default:
      return new GeneralTypeException({
        message: createTimestampedMessage('Database error', exception, exception.code),
        code: 'DATABASE_ERROR',
        statusCode: mapErrorKindToHttpStatus(ErrorKind.INTERNAL),
        userFriendly: false,
        stack: exception.stack,
      });
  }
}

export function mapPrismaException(exception: unknown): GeneralTypeException | null {
  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    return mapKnownRequestError(exception);
  }
  if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
    return new GeneralTypeException({
      message: createTimestampedMessage('Database error', exception),
      code: 'DATABASE_ERROR',
      statusCode: mapErrorKindToHttpStatus(ErrorKind.INTERNAL),
      userFriendly: false,
      stack: exception.stack,
    });
  }
  if (exception instanceof Prisma.PrismaClientValidationError) {
    return new GeneralTypeException({
      message: 'Invalid input',
      code: 'BAD_USER_INPUT',
      statusCode: mapErrorKindToHttpStatus(ErrorKind.VALIDATION),
      userFriendly: true,
    });
  }
  if (exception instanceof Prisma.PrismaClientInitializationError) {
    return new GeneralTypeException({
      message: createTimestampedMessage('Database unavailable', exception),
      code: 'DEPENDENCY_FAILURE',
      statusCode: mapErrorKindToHttpStatus(ErrorKind.DEPENDENCY_FAILURE),
      userFriendly: false,
      stack: exception.stack,
    });
  }
  return null;
}
