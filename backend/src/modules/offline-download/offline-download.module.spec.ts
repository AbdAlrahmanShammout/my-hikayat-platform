import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { OfflineDownloadRepository } from '@/modules/offline-download/repository/offline-download.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { OfflineDownloadModule } from './offline-download.module';
import { OfflineDownloadService } from './offline-download.service';

describe('OfflineDownloadModule', () => {
  it('binds the abstract repository and exports the service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, OfflineDownloadModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        offlineDownload: {
          findFirst: jest.fn(),
          count: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        book: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        category: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        user: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
        plan: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
        subscription: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        auditLog: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
      })
      .compile();
    expect(moduleRef.get(OfflineDownloadService)).toBeDefined();
    expect(moduleRef.get(OfflineDownloadRepository)).toBeDefined();
    await moduleRef.close();
  });
});
