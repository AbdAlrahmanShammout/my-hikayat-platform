import { Test, TestingModule } from '@nestjs/testing';

import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { CategoryModule } from './category.module';
import { CategoryService } from './category.service';

describe('CategoryModule', () => {
  it('binds the abstract repository and exports the service', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CategoryModule],
    })
      .overrideProvider(PrismaProviderService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
        category: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          update: jest.fn(),
        },
      })
      .compile();
    expect(moduleRef.get(CategoryService)).toBeDefined();
    expect(moduleRef.get(CategoryRepository)).toBeDefined();
    await moduleRef.close();
  });
});
