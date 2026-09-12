import { Test, TestingModule } from '@nestjs/testing';

import { PlatformSettingRepository } from '@/modules/platform-setting/repository/platform-setting.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { PlatformSettingModule } from './platform-setting.module';
import { PlatformSettingService } from './platform-setting.service';

describe('PlatformSettingModule', () => {
  it('binds the abstract repository and exports the service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PlatformSettingModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        platformSetting: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
      })
      .compile();
    expect(moduleRef.get(PlatformSettingService)).toBeDefined();
    expect(moduleRef.get(PlatformSettingRepository)).toBeDefined();
    await moduleRef.close();
  });
});
