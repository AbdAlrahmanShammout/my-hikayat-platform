import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { DEFAULT_CATEGORY_WEIGHT } from '@/modules/category/consts';
import { CategoryPage } from '@/modules/category/defs/category-repository.defs';
import {
  CreateCategoryServiceInput,
  ListCategoriesServiceInput,
  UpdateCategoryServiceInput,
} from '@/modules/category/defs/category-service.defs';
import { CategoryEntity } from '@/modules/category/entity/category.entity';
import { CategoryInvalidWeightException } from '@/modules/category/exceptions/category-invalid-weight.exception';
import { CategoryNameConflictException } from '@/modules/category/exceptions/category-name-conflict.exception';
import { CategorySlugConflictException } from '@/modules/category/exceptions/category-slug-conflict.exception';
import { CategoryRepository } from '@/modules/category/repository/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(input: CreateCategoryServiceInput): Promise<CategoryEntity> {
    const name: string = CategoryService.normalizeName(input.name);
    const slug: string = CategoryService.normalizeSlug(input.slug ?? input.name);
    const categoryWeight: number = input.categoryWeight ?? DEFAULT_CATEGORY_WEIGHT;
    CategoryService.assertValidName(name);
    CategoryService.assertValidSlug(slug);
    CategoryService.assertValidWeight(categoryWeight);
    await this.assertNameIsAvailable(name);
    await this.assertSlugIsAvailable(slug);
    return this.categoryRepository.create({ name, slug, categoryWeight });
  }

  async updateCategory(input: UpdateCategoryServiceInput): Promise<CategoryEntity> {
    const current: CategoryEntity = await this.getCategoryById(input.id);
    const name: string =
      input.name !== undefined ? CategoryService.normalizeName(input.name) : current.name;
    const slug: string =
      input.slug !== undefined ? CategoryService.normalizeSlug(input.slug) : current.slug;
    const categoryWeight: number =
      input.categoryWeight !== undefined ? input.categoryWeight : current.categoryWeight;
    CategoryService.assertValidName(name);
    CategoryService.assertValidSlug(slug);
    CategoryService.assertValidWeight(categoryWeight);
    await this.assertNameIsAvailable(name, current.id);
    await this.assertSlugIsAvailable(slug, current.id);
    if (
      name === current.name &&
      slug === current.slug &&
      categoryWeight === current.categoryWeight
    ) {
      return current;
    }
    return this.categoryRepository.update({
      id: current.id,
      name,
      slug,
      categoryWeight,
    });
  }

  async listCategories(input: ListCategoriesServiceInput = {}): Promise<CategoryPage> {
    return this.categoryRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
    });
  }

  async findCategoryById(id: number): Promise<CategoryEntity | null> {
    return this.categoryRepository.findById(id);
  }

  async getCategoryById(id: number): Promise<CategoryEntity> {
    const category: CategoryEntity | null = await this.findCategoryById(id);
    if (category === null) {
      throw new ResourceNotFoundException('Category', id);
    }
    return category;
  }

  async findCategoryBySlug(slug: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findBySlug(CategoryService.normalizeSlug(slug));
  }

  async getCategoryBySlug(slug: string): Promise<CategoryEntity> {
    const normalizedSlug: string = CategoryService.normalizeSlug(slug);
    const category: CategoryEntity | null = await this.findCategoryBySlug(normalizedSlug);
    if (category === null) {
      throw new ResourceNotFoundException('Category', normalizedSlug);
    }
    return category;
  }

  private async assertNameIsAvailable(name: string, currentId?: number): Promise<void> {
    const existing: CategoryEntity | null = await this.categoryRepository.findByName(name);
    if (existing !== null && existing.id !== currentId) {
      throw new CategoryNameConflictException(name);
    }
  }

  private async assertSlugIsAvailable(slug: string, currentId?: number): Promise<void> {
    const existing: CategoryEntity | null = await this.categoryRepository.findBySlug(slug);
    if (existing !== null && existing.id !== currentId) {
      throw new CategorySlugConflictException(slug);
    }
  }

  private static normalizeName(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private static normalizeSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private static assertValidName(name: string): void {
    if (name.length === 0) {
      throw new InvalidStateException({
        message: 'Category name must not be empty',
        code: 'CATEGORY_INVALID_NAME',
      });
    }
  }

  private static assertValidSlug(slug: string): void {
    if (slug.length === 0) {
      throw new InvalidStateException({
        message: 'Category slug must not be empty',
        code: 'CATEGORY_INVALID_SLUG',
      });
    }
  }

  private static assertValidWeight(categoryWeight: number): void {
    if (!Number.isFinite(categoryWeight) || categoryWeight <= 0) {
      throw new CategoryInvalidWeightException();
    }
  }
}
