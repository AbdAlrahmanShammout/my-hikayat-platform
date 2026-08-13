import type { INestApplication } from '@nestjs/common';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import {
  CORS_PREFLIGHT_MAX_AGE_SECONDS,
  REQUEST_JSON_BODY_LIMIT,
} from '@/common/constants/http-surface.constant';
import { InputValidationPipe } from '@/common/pipes/input-validation.pipe';
import { AppConfigService } from '@/config/app/app-config.service';

export function configureHttpSurface(
  app: INestApplication,
  appConfigService: AppConfigService,
): void {
  app.use(helmet());
  app.use(json({ limit: REQUEST_JSON_BODY_LIMIT }));
  app.use(urlencoded({ extended: true, limit: REQUEST_JSON_BODY_LIMIT }));
  app.enableCors({
    origin: appConfigService.allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: CORS_PREFLIGHT_MAX_AGE_SECONDS,
  });
  app.useGlobalPipes(new InputValidationPipe());
}
