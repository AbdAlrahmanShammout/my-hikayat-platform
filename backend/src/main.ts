import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const DEFAULT_LISTEN_PORT = 3000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  await app.listen(DEFAULT_LISTEN_PORT);
  logger.log(`Application listening on port ${DEFAULT_LISTEN_PORT}`);
}

void bootstrap();
