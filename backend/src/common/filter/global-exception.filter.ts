import { Catch, Injectable, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

import { AppConfigService } from '@/config/app/app-config.service';
import { presentException } from '@/common/filter/present-exception';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly appConfigService: AppConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    presentException(exception, host, this.appConfigService, this.logger);
  }
}
