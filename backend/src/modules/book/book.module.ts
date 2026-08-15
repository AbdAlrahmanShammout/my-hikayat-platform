import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { CategoryModule } from '@/modules/category/category.module';
import { UserModule } from '@/modules/user/user.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { BookProcessingStatusService } from './book-processing-status.service';
import { BookPublishingStatusService } from './book-publishing-status.service';
import { BookService } from './book.service';
import { BookPrismaRepository } from './repository/book-prisma.repository';
import { BookRepository } from './repository/book.repository';

@Module({
  imports: [DatabaseProviderModule, CategoryModule, UserModule, AuditModule],
  providers: [
    BookService,
    BookProcessingStatusService,
    BookPublishingStatusService,
    { provide: BookRepository, useClass: BookPrismaRepository },
  ],
  exports: [BookService, BookProcessingStatusService, BookPublishingStatusService],
})
export class BookModule {}
