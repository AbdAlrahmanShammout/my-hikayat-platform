import type { INestApplication } from '@nestjs/common';

import { TransactionRunner } from '@/common/base/transaction-runner';
import { AppConfigService } from '@/config/app/app-config.service';

import { createTestingApp } from './create-testing-app';

describe('App bootstrap (e2e)', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('Given the root module, When the application initializes, Then it becomes ready', async () => {
    app = await createTestingApp();
    expect(app.getHttpAdapter()).toBeDefined();
  });

  it('Given the root module, When configuration is resolved, Then the app config service is available', async () => {
    app = await createTestingApp();
    const appConfigService: AppConfigService = app.get(AppConfigService);
    expect(appConfigService.port).toBe(3000);
    expect(appConfigService.allowedOrigins).toEqual([
      'http://localhost:3000',
      'http://localhost:5173',
    ]);
  });

  it('Given the root module, When TransactionRunner runs work, Then the work commits', async () => {
    app = await createTestingApp();
    const transactionRunner: TransactionRunner = app.get(TransactionRunner);
    const actualResult: string = await transactionRunner.run(() => Promise.resolve('committed'));
    expect(actualResult).toBe('committed');
  });
});
