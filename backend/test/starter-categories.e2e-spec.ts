import type { INestApplication } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { CategoryService } from '@/modules/category/category.service';
import { STARTER_CATEGORIES } from '@/modules/category/consts/starter-categories.constant';
import { CategorySlugConflictException } from '@/modules/category/exceptions/category-slug-conflict.exception';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';

describe('Starter categories (e2e)', () => {
  let app: INestApplication | undefined;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    await app.close();
  });

  function getRunningApp(): INestApplication {
    if (!app) {
      throw new Error('Application was not initialized');
    }
    return app;
  }

  it('Given a migrated database, When starter slugs are loaded, Then each seeded category exists at weight 1', async () => {
    const categoryService: CategoryService = getRunningApp().get(CategoryService);
    for (const starter of STARTER_CATEGORIES) {
      const actualCategory = await categoryService.getCategoryBySlug(starter.slug);
      expect(actualCategory.name).toBe(starter.name);
      expect(actualCategory.slug).toBe(starter.slug);
      expect(actualCategory.categoryWeight).toBe(starter.categoryWeight);
      expect(actualCategory.deletedAt).toBeNull();
    }
  });

  it('Given a starter slug already exists, When the seed insert is replayed, Then a second row is not created', async () => {
    const prismaProviderService: PrismaProviderService =
      getRunningApp().get(PrismaProviderService);
    const beforeCount: number = await prismaProviderService.category.count({
      where: { slug: 'fiction' },
    });
    await prismaProviderService.$executeRaw(
      Prisma.sql`
        INSERT INTO "Category" ("name", "slug", "categoryWeight", "createdAt", "updatedAt")
        VALUES ('Fiction', 'fiction', 1.0000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("slug") DO NOTHING
      `,
    );
    const afterCount: number = await prismaProviderService.category.count({
      where: { slug: 'fiction' },
    });
    expect(beforeCount).toBe(1);
    expect(afterCount).toBe(beforeCount);
  });

  it('Given a starter slug, When createCategory uses that slug, Then the conflict is rejected', async () => {
    const categoryService: CategoryService = getRunningApp().get(CategoryService);
    await expect(
      categoryService.createCategory({ name: 'Fiction Copy', slug: 'fiction' }),
    ).rejects.toBeInstanceOf(CategorySlugConflictException);
  });
});
