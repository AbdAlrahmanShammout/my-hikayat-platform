import type { INestApplication, Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { configureHttpSurface } from '@/common/helpers/configure-http-surface.helper';
import { AppConfigService } from '@/config/app/app-config.service';

export type CreateTestingAppInput = {
  readonly controllers?: Type<unknown>[];
};

export async function createTestingApp(
  input: CreateTestingAppInput = {},
): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
    controllers: input.controllers ?? [],
  }).compile();
  const app: INestApplication = moduleFixture.createNestApplication(undefined, {
    bodyParser: false,
  });
  configureHttpSurface(app, app.get(AppConfigService));
  await app.init();
  return app;
}
