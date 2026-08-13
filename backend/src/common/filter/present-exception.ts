import { HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';

import { normalizeException } from '@/common/filter/exception_mappers/exception-mapper';
import { handleHttpException } from '@/common/filter/exception_return_handler/http_exception.handler';
import { GeneralTypeException } from '@/common/filter/exception_return_handler/type/general-type.exception';
import { AppConfigService } from '@/config/app/app-config.service';
import { Environment } from '@/config/environment';

function shouldHideErrorDetails(appConfigService: AppConfigService): boolean {
  return (
    appConfigService.env === Environment.PRODUCTION || appConfigService.env === Environment.STAGING
  );
}

function createSafeProductionError(normalized: GeneralTypeException): GeneralTypeException {
  if (normalized.statusCode >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
    return new GeneralTypeException({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      userFriendly: false,
    });
  }
  return new GeneralTypeException({
    message: 'Resource not found',
    code: 'RESOURCE_NOT_FOUND',
    statusCode: HttpStatus.NOT_FOUND,
    userFriendly: true,
  });
}

export function presentException(
  exception: unknown,
  host: ArgumentsHost,
  appConfigService: AppConfigService,
  logger: Logger,
): void {
  let normalized: GeneralTypeException = normalizeException(exception);
  logger.error(normalized.message, normalized.stack);
  if (!normalized.userFriendly && shouldHideErrorDetails(appConfigService)) {
    normalized = createSafeProductionError(normalized);
  }
  handleHttpException(normalized, host);
}
