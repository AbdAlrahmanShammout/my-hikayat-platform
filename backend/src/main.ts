import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppConfigService } from '@/config/app/app-config.service';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const appConfigService: AppConfigService = app.get(AppConfigService);
  const logger = new Logger('Bootstrap');
  await app.listen(appConfigService.port);
  logger.log(`Application listening on port ${appConfigService.port}`);
}

void bootstrap();
