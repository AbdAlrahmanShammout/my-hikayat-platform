import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { AppConfigService } from '@/config/app/app-config.service';

describe('App bootstrap (e2e)', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('Given the root module, When the application initializes, Then it becomes ready', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    expect(app.getHttpAdapter()).toBeDefined();
  });

  it('Given the root module, When configuration is resolved, Then the app config service is available', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    const appConfigService: AppConfigService = app.get(AppConfigService);
    expect(appConfigService.port).toBe(3000);
    expect(appConfigService.allowedOrigins).toEqual(['http://localhost:3000']);
  });
});
