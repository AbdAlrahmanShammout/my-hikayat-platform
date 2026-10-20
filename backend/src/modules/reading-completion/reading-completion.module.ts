import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { BookProcessingModule } from '@/modules/book-processing/book-processing.module';
import { PlatformSettingModule } from '@/modules/platform-setting/platform-setting.module';
import { ReadingModule } from '@/modules/reading/reading.module';
import { BookReadingCycleService } from '@/modules/reading-completion/book-reading-cycle.service';
import { BookReadingCyclePrismaRepository } from '@/modules/reading-completion/repository/book-reading-cycle-prisma.repository';
import { BookReadingCycleRepository } from '@/modules/reading-completion/repository/book-reading-cycle.repository';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

@Module({
  imports: [DatabaseProviderModule, BookModule, BookProcessingModule, ReadingModule, PlatformSettingModule],
  providers: [
    BookReadingCycleService,
    { provide: BookReadingCycleRepository, useClass: BookReadingCyclePrismaRepository },
  ],
  exports: [BookReadingCycleService],
})
export class ReadingCompletionModule {}
