import { Test, TestingModule } from '@nestjs/testing';

import { UserRepository } from '@/modules/user/repository/user.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserModule', () => {
  it('binds the abstract repository and exports the service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      })
      .compile();
    expect(moduleRef.get(UserService)).toBeDefined();
    expect(moduleRef.get(UserRepository)).toBeDefined();
    await moduleRef.close();
  });
});
