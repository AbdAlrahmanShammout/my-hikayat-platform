import type { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import { AppConfigService } from '@/config/app/app-config.service';

import { SWAGGER_API_TITLE, SWAGGER_ENABLED_ENVIRONMENTS, SWAGGER_UI_PATH } from './consts';
import { SWAGGER_DOCUMENT_DEFINITIONS } from './swagger-document.definitions';
import { createSwaggerDocument } from './swagger-document.factory';

export class SwaggerProvider {
  static setupSwagger(app: INestApplication): void {
    const appConfigService: AppConfigService = app.get(AppConfigService);
    if (!SWAGGER_ENABLED_ENVIRONMENTS.includes(appConfigService.env)) {
      return;
    }
    for (const definition of SWAGGER_DOCUMENT_DEFINITIONS) {
      const document = createSwaggerDocument(app, appConfigService, definition);
      SwaggerModule.setup(`${SWAGGER_UI_PATH}/${definition.name}`, app, document, {
        jsonDocumentUrl: definition.jsonPath,
        customSiteTitle: `${SWAGGER_API_TITLE} ${definition.titleSuffix}`,
      });
    }
  }
}
