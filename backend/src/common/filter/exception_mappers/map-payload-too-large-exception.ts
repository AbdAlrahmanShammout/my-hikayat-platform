import { HttpStatus } from '@nestjs/common';

import { GeneralTypeException } from '@/common/filter/exception_return_handler/type/general-type.exception';

const PAYLOAD_TOO_LARGE_STATUS = Number(HttpStatus.PAYLOAD_TOO_LARGE);

function isMulterFileTooLarge(exception: unknown): boolean {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'name' in exception &&
    exception.name === 'MulterError' &&
    'code' in exception &&
    exception.code === 'LIMIT_FILE_SIZE'
  );
}

function isPayloadTooLargeError(exception: unknown): boolean {
  if (typeof exception !== 'object' || exception === null) {
    return false;
  }
  if (isMulterFileTooLarge(exception)) {
    return true;
  }
  if ('type' in exception && exception.type === 'entity.too.large') {
    return true;
  }
  if ('name' in exception && exception.name === 'PayloadTooLargeError') {
    return true;
  }
  return 'status' in exception && exception.status === PAYLOAD_TOO_LARGE_STATUS;
}

export function mapPayloadTooLargeException(exception: unknown): GeneralTypeException | null {
  if (!isPayloadTooLargeError(exception)) {
    return null;
  }
  return new GeneralTypeException({
    message: 'Request body too large',
    code: 'PAYLOAD_TOO_LARGE',
    statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
    userFriendly: true,
  });
}
