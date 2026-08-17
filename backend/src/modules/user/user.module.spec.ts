import { Test, TestingModule } from '@nestjs/testing';

import { AdminInvitationRepository } from '@/modules/user/repository/admin-invitation.repository';
import { UserRepository } from '@/modules/user/repository/user.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { AdminInvitationService } from './admin-invitation.service';
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
        $transaction: jest.fn(),
        user: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        adminInvitation: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
      })
      .compile();
    expect(moduleRef.get(UserService)).toBeDefined();
    expect(moduleRef.get(UserRepository)).toBeDefined();
    expect(moduleRef.get(AdminInvitationService)).toBeDefined();
    expect(moduleRef.get(AdminInvitationRepository)).toBeDefined();
    await moduleRef.close();
  });
});
