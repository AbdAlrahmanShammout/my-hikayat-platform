import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { UserModule } from '@/modules/user/user.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { ReadingProgressService } from './reading-progress.service';
import { ReadingProgressPrismaRepository } from './repository/reading-progress-prisma.repository';
import { ReadingProgressRepository } from './repository/reading-progress.repository';

@Module({
  imports: [DatabaseProviderModule, BookModule, UserModule],
  providers: [
    ReadingProgressService,
    { provide: ReadingProgressRepository, useClass: ReadingProgressPrismaRepository },
  ],
  exports: [ReadingProgressService],
})
export class ReadingModule {}
