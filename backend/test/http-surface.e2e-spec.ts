import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

import type { Server } from 'node:http';
import request from 'supertest';

import { UNAUTHENTICATED_THROTTLE_LIMIT } from '@/common/constants/http-surface.constant';
import { PublicRoute } from '@/common/decorators/route/public-route.decorator';

import { createTestingApp } from './create-testing-app';

class ProbeRequestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}

@Controller('http-surface-probe')
class HttpSurfaceProbeController {
  @PublicRoute()
  @Post()
  @HttpCode(HttpStatus.OK)
  executeProbe(@Body() body: ProbeRequestDto): ProbeRequestDto {
    return body;
  }
}

describe('HTTP surface (e2e)', () => {
  let app: INestApplication | undefined;

  beforeEach(async () => {
    app = await createTestingApp({ controllers: [HttpSurfaceProbeController] });
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

  function getServer(): Server {
    return getRunningApp().getHttpServer() as Server;
  }

  it('Given a live request, When Helmet is installed, Then security headers are present', async () => {
    const actualResponse = await request(getServer()).get('/health/live');
    expect(actualResponse.headers['x-content-type-options']).toBe('nosniff');
    expect(actualResponse.headers['x-dns-prefetch-control']).toBe('off');
  });

  it('Given an allowed Origin, When GET /health/live, Then CORS allows that origin', async () => {
    const actualResponse = await request(getServer())
      .get('/health/live')
      .set('Origin', 'http://localhost:3000');
    expect(actualResponse.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(actualResponse.headers['access-control-allow-credentials']).toBe('true');
  });

  it('Given a disallowed Origin, When GET /health/live, Then CORS does not reflect it', async () => {
    const actualResponse = await request(getServer())
      .get('/health/live')
      .set('Origin', 'https://evil.example');
    expect(actualResponse.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('Given an allowed Origin, When a browser preflights PUT progress, Then CORS allows PUT', async () => {
    const actualResponse = await request(getServer())
      .options('/reader/books/1/progress')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'PUT')
      .set('Access-Control-Request-Headers', 'Authorization,Content-Type');
    expect(actualResponse.status).toBe(HttpStatus.NO_CONTENT);
    expect(actualResponse.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(actualResponse.headers['access-control-allow-credentials']).toBe('true');
    expect(actualResponse.headers['access-control-allow-methods'].split(/,\s*/)).toEqual(
      expect.arrayContaining(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    );
  });

  it('Given a disallowed Origin, When a browser preflights PUT, Then CORS does not reflect it', async () => {
    const actualResponse = await request(getServer())
      .options('/reader/books/1/progress')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'PUT');
    expect(actualResponse.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('Given an invalid body, When POST hits a DTO route, Then the validation error shape is returned', async () => {
    const actualResponse = await request(getServer())
      .post('/http-surface-probe')
      .send({ title: 1 });
    expect(actualResponse.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(actualResponse.body).toEqual(
      expect.objectContaining({
        code: 'BAD_USER_INPUT',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );
    expect(actualResponse.body.validationErrorObjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'title',
        }),
      ]),
    );
  });

  it('Given a body over the cap, When POST is issued, Then the request is rejected as too large', async () => {
    const actualResponse = await request(getServer())
      .post('/http-surface-probe')
      .send({ title: 'a'.repeat(120_000) });
    expect(actualResponse.status).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(actualResponse.body).toEqual(
      expect.objectContaining({
        code: 'PAYLOAD_TOO_LARGE',
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      }),
    );
  });

  it('Given an unauthenticated public route, When the tightened limit is exceeded, Then the request is rejected', async () => {
    const server: Server = getServer();
    for (let i = 0; i < UNAUTHENTICATED_THROTTLE_LIMIT; i += 1) {
      const allowedResponse = await request(server)
        .post('/http-surface-probe')
        .send({ title: 'probe' });
      expect(allowedResponse.status).toBe(HttpStatus.OK);
    }
    const actualResponse = await request(server)
      .post('/http-surface-probe')
      .send({ title: 'probe' });
    expect(actualResponse.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(actualResponse.body).toEqual(
      expect.objectContaining({
        code: 'HTTP_EXCEPTION',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      }),
    );
  });
});
