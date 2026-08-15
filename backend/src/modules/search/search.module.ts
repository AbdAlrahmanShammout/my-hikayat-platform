import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';

import { SearchService } from './search.service';

@Module({
  imports: [BookModule],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
