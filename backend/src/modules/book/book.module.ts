import { Module } from '@nestjs/common';

import { CategoryModule } from '@/modules/category/category.module';
import { UserModule } from '@/modules/user/user.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { BookService } from './book.service';
import { BookPrismaRepository } from './repository/book-prisma.repository';
import { BookRepository } from './repository/book.repository';

@Module({
  imports: [DatabaseProviderModule, CategoryModule, UserModule],
  providers: [BookService, { provide: BookRepository, useClass: BookPrismaRepository }],
  exports: [BookService],
})
export class BookModule {}
