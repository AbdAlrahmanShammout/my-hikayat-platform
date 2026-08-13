import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import type { Server } from 'node:http';
import request from 'supertest';

import { AppModule } from '@/app.module';

describe('Exception filter (e2e)', () => {
  let app: INestApplication | undefined;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

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

  it('Given an unknown route, When GET is issued, Then the body uses the canonical error shape', async () => {
    const actualResponse = await request(getRunningApp().getHttpServer() as Server).get(
      '/does-not-exist',
    );
    expect(actualResponse.status).toBe(404);
    expect(actualResponse.body).toEqual(
      expect.objectContaining({
        statusCode: 404,
        code: 'HTTP_EXCEPTION',
      }),
    );
    expect(actualResponse.body).toHaveProperty('message');
  });
});
