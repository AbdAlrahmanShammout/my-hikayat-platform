import { Module } from '@nestjs/common';

import { CategoryModule } from '@/modules/category/category.module';
import { UserModule } from '@/modules/user/user.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { BookProcessingStatusService } from './book-processing-status.service';
import { BookService } from './book.service';
import { BookPrismaRepository } from './repository/book-prisma.repository';
import { BookRepository } from './repository/book.repository';

@Module({
  imports: [DatabaseProviderModule, CategoryModule, UserModule],
  providers: [
    BookService,
    BookProcessingStatusService,
    { provide: BookRepository, useClass: BookPrismaRepository },
  ],
  exports: [BookService, BookProcessingStatusService],
})
export class BookModule {}
