import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';

describe('AppModule', () => {
  it('compiles the root module', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const actualAppModule: AppModule = moduleRef.get(AppModule);
    expect(actualAppModule).toBeDefined();
    await moduleRef.close();
  });
});
