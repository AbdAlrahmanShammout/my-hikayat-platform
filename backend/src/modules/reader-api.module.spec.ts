import { Test, TestingModule } from '@nestjs/testing';

import { ReaderApiModule } from './reader-api.module';

describe('ReaderApiModule', () => {
  it('compiles as an empty audience shell', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ReaderApiModule],
    }).compile();
    const actualModule: ReaderApiModule = moduleRef.get(ReaderApiModule);
    expect(actualModule).toBeDefined();
    await moduleRef.close();
  });
});
