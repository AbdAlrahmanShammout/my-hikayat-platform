import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { CollectionService } from './collection.service';
import { CollectionPrismaRepository } from './repository/collection-prisma.repository';
import { CollectionRepository } from './repository/collection.repository';

@Module({
  imports: [DatabaseProviderModule, BookModule],
  providers: [
    CollectionService,
    { provide: CollectionRepository, useClass: CollectionPrismaRepository },
  ],
  exports: [CollectionService],
})
export class CollectionModule {}
