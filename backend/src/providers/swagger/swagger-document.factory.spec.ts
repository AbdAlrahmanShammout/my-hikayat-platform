import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';

import { ConfigsModule } from '@/config/configs.module';
import { Environment } from '@/config/environment';
import { ReaderApiModule } from '@/modules/reader-api.module';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

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
      imports: [
        ConfigsModule,
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
        ReaderApiModule,
      ],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: { create: jest.fn(), findFirst: jest.fn() },
      })
      .compile();
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
    expect(actualDocument.paths).toHaveProperty('/auth/register');
    expect(actualDocument.paths).toHaveProperty('/auth/login');
  });
});
