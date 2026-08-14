import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { Environment } from '@/config/environment';
import {
  SWAGGER_ADMIN_JSON_PATH,
  SWAGGER_AUTHOR_JSON_PATH,
  SWAGGER_READER_JSON_PATH,
} from '@/providers/swagger/consts';

import { createTestingApp } from './create-testing-app';

describe('Swagger (e2e)', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  function getRunningApp(): INestApplication {
    if (!app) {
      throw new Error('Application was not initialized');
    }
    return app;
  }

  function getServer(): Server {
    return getRunningApp().getHttpServer() as Server;
  }

  it('Given the test environment, When reader docs JSON is requested, Then the route is absent', async () => {
    app = await createTestingApp();
    const actualResponse = await request(getServer()).get(`/${SWAGGER_READER_JSON_PATH}`);
    expect(actualResponse.status).toBe(404);
  });

  it('Given development, When audience docs JSON is requested, Then OpenAPI documents are returned', async () => {
    app = await createTestingApp({ env: Environment.DEVELOPMENT });
    const readerResponse = await request(getServer()).get(`/${SWAGGER_READER_JSON_PATH}`);
    const authorResponse = await request(getServer()).get(`/${SWAGGER_AUTHOR_JSON_PATH}`);
    const adminResponse = await request(getServer()).get(`/${SWAGGER_ADMIN_JSON_PATH}`);
    expect(readerResponse.status).toBe(200);
    expect(readerResponse.body.openapi).toBeDefined();
    expect(readerResponse.body.info.title).toContain('Reader');
    expect(authorResponse.status).toBe(200);
    expect(authorResponse.body.info.title).toContain('Author');
    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.info.title).toContain('Admin');
  });

  it('Given production, When reader docs JSON is requested, Then the route is absent', async () => {
    app = await createTestingApp({ env: Environment.PRODUCTION });
    const actualResponse = await request(getServer()).get(`/${SWAGGER_READER_JSON_PATH}`);
    expect(actualResponse.status).toBe(404);
  });
});
