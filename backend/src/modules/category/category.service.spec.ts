import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { DEFAULT_CATEGORY_WEIGHT } from '@/modules/category/consts';
import { CategoryEntity } from '@/modules/category/entity/category.entity';
import { CategoryInvalidWeightException } from '@/modules/category/exceptions/category-invalid-weight.exception';
import { CategoryNameConflictException } from '@/modules/category/exceptions/category-name-conflict.exception';
import { CategorySlugConflictException } from '@/modules/category/exceptions/category-slug-conflict.exception';

import { CategoryService } from './category.service';

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

describe('CategoryService', () => {
  let mockCategoryRepository: {
    create: jest.Mock;
    update: jest.Mock;
    findById: jest.Mock;
    findBySlug: jest.Mock;
    findByName: jest.Mock;
    list: jest.Mock;
  };
  let categoryService: CategoryService;

  beforeEach(() => {
    mockCategoryRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByName: jest.fn(),
      list: jest.fn(),
    };
    categoryService = new CategoryService(mockCategoryRepository);
  });

  describe('createCategory', () => {
    it('normalizes name and slug and applies the default weight', async () => {
      const expectedCategory = createSampleCategory();
      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.findBySlug.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue(expectedCategory);
      const actualCategory = await categoryService.createCategory({
        name: '  Picture   Books ',
      });
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        name: 'Picture Books',
        slug: 'picture-books',
        categoryWeight: DEFAULT_CATEGORY_WEIGHT,
      });
      expect(actualCategory).toBe(expectedCategory);
    });

    it('rejects a duplicate slug', async () => {
      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.findBySlug.mockResolvedValue(createSampleCategory());
      await expect(
        categoryService.createCategory({ name: 'Picture Books' }),
      ).rejects.toBeInstanceOf(CategorySlugConflictException);
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('rejects a duplicate name', async () => {
      mockCategoryRepository.findByName.mockResolvedValue(createSampleCategory());
      mockCategoryRepository.findBySlug.mockResolvedValue(null);
      await expect(
        categoryService.createCategory({ name: 'Picture Books', slug: 'picture-books-2' }),
      ).rejects.toBeInstanceOf(CategoryNameConflictException);
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('rejects a non-positive category weight', async () => {
      await expect(
        categoryService.createCategory({ name: 'Picture Books', categoryWeight: 0 }),
      ).rejects.toBeInstanceOf(CategoryInvalidWeightException);
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('rejects an empty name', async () => {
      await expect(categoryService.createCategory({ name: '   ' })).rejects.toBeInstanceOf(
        InvalidStateException,
      );
    });
  });

  describe('updateCategory', () => {
    it('updates category weight for an existing category', async () => {
      const current = createSampleCategory();
      const expectedCategory = new CategoryEntity({
        ...current,
        categoryWeight: 2,
      });
      mockCategoryRepository.findById.mockResolvedValue(current);
      mockCategoryRepository.findByName.mockResolvedValue(current);
      mockCategoryRepository.findBySlug.mockResolvedValue(current);
      mockCategoryRepository.update.mockResolvedValue(expectedCategory);
      const actualCategory = await categoryService.updateCategory({
        id: 1,
        categoryWeight: 2,
      });
      expect(mockCategoryRepository.update).toHaveBeenCalledWith({
        id: 1,
        name: 'Picture Books',
        slug: 'picture-books',
        categoryWeight: 2,
      });
      expect(actualCategory).toBe(expectedCategory);
    });

    it('does not write when no category fields change', async () => {
      const current = createSampleCategory();
      mockCategoryRepository.findById.mockResolvedValue(current);
      mockCategoryRepository.findByName.mockResolvedValue(current);
      mockCategoryRepository.findBySlug.mockResolvedValue(current);
      const actualCategory = await categoryService.updateCategory({
        id: 1,
        name: 'Picture Books',
      });
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
      expect(actualCategory).toBe(current);
    });
  });

  describe('listCategories', () => {
    it('applies default pagination', async () => {
      mockCategoryRepository.list.mockResolvedValue({
        entities: [createSampleCategory()],
        total: 1,
      });
      const actualPage = await categoryService.listCategories();
      expect(mockCategoryRepository.list).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
      });
      expect(actualPage.total).toBe(1);
    });
  });

  describe('getCategoryById', () => {
    it('throws when the category is missing', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);
      await expect(categoryService.getCategoryById(99)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });
});
