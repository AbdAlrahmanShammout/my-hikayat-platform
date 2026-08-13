import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { HEALTH_OK_STATUS } from '@/health/health.service';

import { createTestingApp } from './create-testing-app';

describe('Health (e2e)', () => {
  let app: INestApplication | undefined;

  beforeEach(async () => {
    app = await createTestingApp();
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

  it('Given a running process, When GET /health/live, Then it returns 200 with status ok', async () => {
    const actualResponse = await request(getRunningApp().getHttpServer() as Server).get(
      '/health/live',
    );
    expect(actualResponse.status).toBe(200);
    expect(actualResponse.body).toEqual({ status: HEALTH_OK_STATUS });
  });

  it('Given a running process, When GET /health/ready, Then it returns 200 with status ok', async () => {
    const actualResponse = await request(getRunningApp().getHttpServer() as Server).get(
      '/health/ready',
    );
    expect(actualResponse.status).toBe(200);
    expect(actualResponse.body).toEqual({ status: HEALTH_OK_STATUS });
  });
});
