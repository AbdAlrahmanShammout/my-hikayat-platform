import type { INestApplication } from '@nestjs/common';
import { json, urlencoded } from 'express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import {
  CORS_ALLOWED_METHODS,
  CORS_PREFLIGHT_MAX_AGE_SECONDS,
  REQUEST_JSON_BODY_LIMIT,
} from '@/common/constants/http-surface.constant';
import { resolveCorsOrigin } from '@/common/helpers/resolve-cors-origin.helper';
import { InputValidationPipe } from '@/common/pipes/input-validation.pipe';
import { AppConfigService } from '@/config/app/app-config.service';

export type ConfigureHttpSurfaceInput = {
  readonly documentationUiPath?: string;
};

function isDocumentationPath(
  requestPath: string,
  documentationUiPath: string | undefined,
): boolean {
  if (documentationUiPath === undefined || documentationUiPath === '') {
    return false;
  }
  const documentationRoot = `/${documentationUiPath}`;
  return requestPath === documentationRoot || requestPath.startsWith(`${documentationRoot}/`);
}

function applySecurityHeaders(
  app: INestApplication,
  documentationUiPath: string | undefined,
): void {
  app.use((req: Request, res: Response, next: NextFunction): void => {
    const helmetMiddleware = isDocumentationPath(req.path, documentationUiPath)
      ? helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
              connectSrc: ["'self'"],
            },
          },
        })
      : helmet();
    helmetMiddleware(req, res, next);
  });
}

export function configureHttpSurface(
  app: INestApplication,
  appConfigService: AppConfigService,
  input: ConfigureHttpSurfaceInput = {},
): void {
  applySecurityHeaders(app, input.documentationUiPath);
  app.use(
    json({
      limit: REQUEST_JSON_BODY_LIMIT,
      verify: (req: Request, _res: Response, buf: Buffer): void => {
        (req as Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );
  app.use(urlencoded({ extended: true, limit: REQUEST_JSON_BODY_LIMIT }));
  app.enableCors({
    origin: resolveCorsOrigin({
      env: appConfigService.env,
      allowedOrigins: appConfigService.allowedOrigins,
    }),
    methods: [...CORS_ALLOWED_METHODS],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: CORS_PREFLIGHT_MAX_AGE_SECONDS,
  });
  app.useGlobalPipes(new InputValidationPipe());
}
