import { Test, TestingModule } from '@nestjs/testing';

import { CollectionRepository } from '@/modules/collection/repository/collection.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { CollectionDiscoveryService } from './collection-discovery.service';
import { CollectionModule } from './collection.module';
import { CollectionService } from './collection.service';

describe('CollectionModule', () => {
  it('binds the abstract repository and exports the service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CollectionModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        collection: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
        collectionBook: {
          createMany: jest.fn(),
          deleteMany: jest.fn(),
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
        auditLog: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
      })
      .compile();
    expect(moduleRef.get(CollectionService)).toBeDefined();
    expect(moduleRef.get(CollectionDiscoveryService)).toBeDefined();
    expect(moduleRef.get(CollectionRepository)).toBeDefined();
    await moduleRef.close();
  });
});
