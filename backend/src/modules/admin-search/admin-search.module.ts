import { Module } from '@nestjs/common';

import { AdminSearchService } from '@/modules/admin-search/admin-search.service';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

@Module({
  imports: [DatabaseProviderModule],
  providers: [AdminSearchService],
  exports: [AdminSearchService],
})
export class AdminSearchModule {}
