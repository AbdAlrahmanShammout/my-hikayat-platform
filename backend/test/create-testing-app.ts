import type { INestApplication, Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { configureHttpSurface } from '@/common/helpers/configure-http-surface.helper';
import { AppConfigService } from '@/config/app/app-config.service';
import type { Environment } from '@/config/environment';
import { SWAGGER_UI_PATH } from '@/providers/swagger/consts';
import { SwaggerProvider } from '@/providers/swagger/swagger.provider';

export type CreateTestingAppInput = {
  readonly controllers?: Type<unknown>[];
  readonly env?: Environment;
};

export async function createTestingApp(
  input: CreateTestingAppInput = {},
): Promise<INestApplication> {
  const testingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
    controllers: input.controllers ?? [],
  });
  if (input.env !== undefined) {
    testingModuleBuilder.overrideProvider(AppConfigService).useValue({
      env: input.env,
      port: 3000,
      allowedOrigins: ['http://localhost:3000'],
    });
  }
  const moduleFixture: TestingModule = await testingModuleBuilder.compile();
  const app: INestApplication = moduleFixture.createNestApplication(undefined, {
    bodyParser: false,
  });
  const appConfigService: AppConfigService = app.get(AppConfigService);
  configureHttpSurface(app, appConfigService, { documentationUiPath: SWAGGER_UI_PATH });
  SwaggerProvider.setupSwagger(app);
  await app.init();
  return app;
}
