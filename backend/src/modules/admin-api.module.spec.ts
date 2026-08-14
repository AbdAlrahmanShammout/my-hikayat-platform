import { Test, TestingModule } from '@nestjs/testing';

import { AdminApiModule } from './admin-api.module';

describe('AdminApiModule', () => {
  it('compiles as an empty audience shell', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AdminApiModule],
    }).compile();
    const actualModule: AdminApiModule = moduleRef.get(AdminApiModule);
    expect(actualModule).toBeDefined();
    await moduleRef.close();
  });
});
