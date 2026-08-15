import { Test, TestingModule } from '@nestjs/testing';

import { ReadingProgressRepository } from '@/modules/reading/repository/reading-progress.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { ReadingProgressService } from './reading-progress.service';
import { ReadingModule } from './reading.module';

describe('ReadingModule', () => {
  it('binds the abstract repository and exports the progress service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ReadingModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        readingProgress: {
          create: jest.fn(),
          findFirst: jest.fn(),
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
      })
      .compile();
    expect(moduleRef.get(ReadingProgressService)).toBeDefined();
    expect(moduleRef.get(ReadingProgressRepository)).toBeDefined();
    await moduleRef.close();
  });
});
