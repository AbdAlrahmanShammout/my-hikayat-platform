import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { EntitlementModule } from '@/modules/entitlement/entitlement.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { SearchReadModelPrismaRepository } from './repository/search-read-model-prisma.repository';
import { SearchReadModelRepository } from './repository/search-read-model.repository';
import { SearchService } from './search.service';

@Module({
  imports: [DatabaseProviderModule, BookModule, EntitlementModule],
  providers: [
    SearchService,
    { provide: SearchReadModelRepository, useClass: SearchReadModelPrismaRepository },
  ],
  exports: [SearchService],
})
export class SearchModule {}
