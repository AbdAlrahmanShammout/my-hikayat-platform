import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { BookRepository } from '@/modules/book/repository/book.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookProcessingStatusService } from './book-processing-status.service';
import { BookPublishingStatusService } from './book-publishing-status.service';
import { BookModule } from './book.module';
import { BookService } from './book.service';

describe('BookModule', () => {
  it('binds the abstract repository and exports the catalog services', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, BookModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
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
    expect(moduleRef.get(BookService)).toBeDefined();
    expect(moduleRef.get(BookProcessingStatusService)).toBeDefined();
    expect(moduleRef.get(BookPublishingStatusService)).toBeDefined();
    expect(moduleRef.get(BookRepository)).toBeDefined();
    await moduleRef.close();
  });
});
