import { Module } from '@nestjs/common';

import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { CategoryService } from './category.service';
import { CategoryPrismaRepository } from './repository/category-prisma.repository';
import { CategoryRepository } from './repository/category.repository';

@Module({
  imports: [DatabaseProviderModule],
  providers: [CategoryService, { provide: CategoryRepository, useClass: CategoryPrismaRepository }],
  exports: [CategoryService],
})
export class CategoryModule {}
