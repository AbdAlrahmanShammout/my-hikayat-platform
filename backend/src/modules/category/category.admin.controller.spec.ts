import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CategoryService } from '@/modules/category/category.service';
import { CategoryEntity } from '@/modules/category/entity/category.entity';

import { CategoryAdminController } from './category.admin.controller';

function createSampleCategory(categoryWeight = 1.25): CategoryEntity {
  return new CategoryEntity({
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    name: 'Picture Books',
    slug: 'picture-books',
    categoryWeight,
  });
}

describe('CategoryAdminController', () => {
  let categoryAdminController: CategoryAdminController;
  let mockCategoryService: {
    listCategories: jest.Mock;
    getCategoryById: jest.Mock;
    updateCategory: jest.Mock;
  };

  beforeEach(async () => {
    mockCategoryService = {
      listCategories: jest.fn(),
      getCategoryById: jest.fn(),
      updateCategory: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [CategoryAdminController],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    categoryAdminController = moduleRef.get(CategoryAdminController);
  });

  describe('listCategories', () => {
    it('maps pagination fields into the service', async () => {
      mockCategoryService.listCategories.mockResolvedValue({
        entities: [createSampleCategory()],
        total: 1,
      });
      const actualResponse = await categoryAdminController.listCategories({
        limit: 10,
        offset: 0,
      });
      expect(mockCategoryService.listCategories).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.categories[0].categoryWeight).toBe(1.25);
    });
  });

  describe('getCategory', () => {
    it('returns the requested category', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(createSampleCategory());
      const actualResponse = await categoryAdminController.getCategory(1);
      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith(1);
      expect(actualResponse.id).toBe(1);
      expect(actualResponse.categoryWeight).toBe(1.25);
    });
  });

  describe('updateCategory', () => {
    it('maps the category id and weight into the service', async () => {
      mockCategoryService.updateCategory.mockResolvedValue(createSampleCategory(2));
      const actualResponse = await categoryAdminController.updateCategory(1, {
        categoryWeight: 2,
      });
      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith({
        id: 1,
        categoryWeight: 2,
      });
      expect(actualResponse.categoryWeight).toBe(2);
    });
  });
});
