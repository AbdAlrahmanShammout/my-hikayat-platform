import { Catch, Injectable, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

import { ValidationExceptions } from '@/common/exceptions/validation.exception';
import { AppConfigService } from '@/config/app/app-config.service';
import { presentException } from '@/common/filter/present-exception';

@Catch(ValidationExceptions)
@Injectable()
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  constructor(private readonly appConfigService: AppConfigService) {}

  catch(exception: ValidationExceptions, host: ArgumentsHost): void {
    presentException(exception, host, this.appConfigService, this.logger);
  }
}
