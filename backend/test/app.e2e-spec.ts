import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@/app.module';

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
});
