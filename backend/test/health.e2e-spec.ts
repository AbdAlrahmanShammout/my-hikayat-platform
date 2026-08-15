import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import type { Server } from 'node:http';
import request from 'supertest';

import { UNAUTHENTICATED_THROTTLE_LIMIT } from '@/common/constants/http-surface.constant';
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

  it('Given repeated liveness probes, When they exceed the unauthenticated limit, Then health stays available', async () => {
    const server: Server = getRunningApp().getHttpServer() as Server;
    const requestCount: number = UNAUTHENTICATED_THROTTLE_LIMIT + 1;
    for (let i = 0; i < requestCount; i += 1) {
      const actualResponse = await request(server).get('/health/live');
      expect(actualResponse.status).toBe(HttpStatus.OK);
      expect(actualResponse.body).toEqual({ status: HEALTH_OK_STATUS });
    }
  });
});
