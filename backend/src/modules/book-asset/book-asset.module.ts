import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { BookAssetService } from './book-asset.service';
import { BookAssetPrismaRepository } from './repository/book-asset-prisma.repository';
import { BookAssetRepository } from './repository/book-asset.repository';

@Module({
  imports: [DatabaseProviderModule, BookModule],
  providers: [
    BookAssetService,
    { provide: BookAssetRepository, useClass: BookAssetPrismaRepository },
  ],
  exports: [BookAssetService],
})
export class BookAssetModule {}
