import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Environment } from '@/config/environment';
import { ReaderApiModule } from '@/modules/reader-api.module';

import { SWAGGER_API_TITLE } from './consts';
import { SWAGGER_DOCUMENT_DEFINITIONS } from './swagger-document.definitions';
import { createSwaggerDocument } from './swagger-document.factory';

describe('createSwaggerDocument', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('builds an OpenAPI document with bearer auth for the audience module', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ReaderApiModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    const readerDefinition = SWAGGER_DOCUMENT_DEFINITIONS[0];
    const actualDocument = createSwaggerDocument(
      app,
      { env: Environment.DEVELOPMENT } as never,
      readerDefinition,
    );
    expect(actualDocument.info.title).toBe(`${SWAGGER_API_TITLE} ${readerDefinition.titleSuffix}`);
    expect(actualDocument.components?.securitySchemes).toHaveProperty('bearer');
  });
});
