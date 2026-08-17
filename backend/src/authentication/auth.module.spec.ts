import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';

import { ConfigsModule } from '@/config/configs.module';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

describe('AuthModule', () => {
  it('provides the auth service and controller', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]), AuthModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: { create: jest.fn(), findFirst: jest.fn() },
        adminInvitation: { create: jest.fn(), findFirst: jest.fn() },
      })
      .compile();
    expect(moduleRef.get(AuthService)).toBeDefined();
    expect(moduleRef.get(AuthController)).toBeDefined();
    await moduleRef.close();
  });
});
