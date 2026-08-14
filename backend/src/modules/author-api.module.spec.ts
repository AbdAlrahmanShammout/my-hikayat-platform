import { Test, TestingModule } from '@nestjs/testing';

import { AuthorApiModule } from './author-api.module';

describe('AuthorApiModule', () => {
  it('compiles as an empty audience shell', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AuthorApiModule],
    }).compile();
    const actualModule: AuthorApiModule = moduleRef.get(AuthorApiModule);
    expect(actualModule).toBeDefined();
    await moduleRef.close();
  });
});
