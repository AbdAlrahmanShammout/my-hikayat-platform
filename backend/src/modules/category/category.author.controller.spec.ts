import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CategoryService } from '@/modules/category/category.service';
import { CategoryEntity } from '@/modules/category/entity/category.entity';

import { CategoryAuthorController } from './category.author.controller';

function createSampleCategory(): CategoryEntity {
  return new CategoryEntity({
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    name: 'Picture Books',
    slug: 'picture-books',
    categoryWeight: 1.25,
  });
}

describe('CategoryAuthorController', () => {
  let categoryAuthorController: CategoryAuthorController;
  let mockCategoryService: {
    listCategories: jest.Mock;
  };

  beforeEach(async () => {
    mockCategoryService = {
      listCategories: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [CategoryAuthorController],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    categoryAuthorController = moduleRef.get(CategoryAuthorController);
  });

  describe('listCategories', () => {
    it('maps pagination fields into the service', async () => {
      mockCategoryService.listCategories.mockResolvedValue({
        entities: [createSampleCategory()],
        total: 1,
      });
      const actualResponse = await categoryAuthorController.listCategories({
        limit: 10,
        offset: 0,
      });
      expect(mockCategoryService.listCategories).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.categories[0].slug).toBe('picture-books');
      expect(actualResponse.categories[0].categoryWeight).toBe(1.25);
    });
  });
});
