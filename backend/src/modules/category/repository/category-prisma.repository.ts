import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  CategoryPage,
  CreateCategoryRepoInput,
  ListCategoriesRepoInput,
  UpdateCategoryRepoInput,
} from '@/modules/category/defs/category-repository.defs';
import { CategoryEntity } from '@/modules/category/entity/category.entity';
import { CategoryMapper } from '@/modules/category/mapper/category.mapper';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class CategoryPrismaRepository implements CategoryRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateCategoryRepoInput,
    context?: TransactionContext,
  ): Promise<CategoryEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        categoryWeight: input.categoryWeight,
      },
    });
    return CategoryMapper.toEntity(result);
  }

  async update(
    input: UpdateCategoryRepoInput,
    context?: TransactionContext,
  ): Promise<CategoryEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const data: Prisma.CategoryUncheckedUpdateInput = {};
    if (input.name !== undefined) {
      data.name = input.name;
    }
    if (input.slug !== undefined) {
      data.slug = input.slug;
    }
    if (input.categoryWeight !== undefined) {
      data.categoryWeight = input.categoryWeight;
    }
    const result = await client.category.update({
      where: { id: input.id },
      data,
    });
    return CategoryMapper.toEntity(result);
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    const result = await this.prismaProviderService.category.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return CategoryMapper.toEntity(result);
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const result = await this.prismaProviderService.category.findFirst({
      where: { slug, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return CategoryMapper.toEntity(result);
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const result = await this.prismaProviderService.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return CategoryMapper.toEntity(result);
  }

  async list(input: ListCategoriesRepoInput): Promise<CategoryPage> {
    const where = { deletedAt: null };
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.category.findMany({
        where,
        orderBy: { name: 'asc' },
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.category.count({ where }),
    ]);
    return {
      entities: rows.map((row) => CategoryMapper.toEntity(row)),
      total,
    };
  }
}
