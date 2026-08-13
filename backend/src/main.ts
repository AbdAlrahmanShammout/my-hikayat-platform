import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { configureHttpSurface } from '@/common/helpers/configure-http-surface.helper';
import { AppConfigService } from '@/config/app/app-config.service';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const appConfigService: AppConfigService = app.get(AppConfigService);
  configureHttpSurface(app, appConfigService);
  const logger = new Logger('Bootstrap');
  await app.listen(appConfigService.port);
  logger.log(`Application listening on port ${appConfigService.port}`);
}

void bootstrap();
