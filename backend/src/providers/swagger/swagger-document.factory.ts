import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';

import { AppConfigService } from '@/config/app/app-config.service';

import { SWAGGER_API_TITLE, SWAGGER_DOCUMENT_VERSION } from './consts';
import type { SwaggerDocumentDefinition } from './swagger-document.definitions';

export function createSwaggerDocument(
  app: INestApplication,
  config: AppConfigService,
  definition: SwaggerDocumentDefinition,
): OpenAPIObject {
  const documentBuilder = new DocumentBuilder()
    .setTitle(`${SWAGGER_API_TITLE} ${definition.titleSuffix}`)
    .setDescription(`${definition.description} Environment: ${config.env}.`)
    .setVersion(SWAGGER_DOCUMENT_VERSION);
  if (definition.hasBearerAuth) {
    documentBuilder.addBearerAuth();
  }
  return SwaggerModule.createDocument(app, documentBuilder.build(), {
    include: [...definition.include],
  });
}
