import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { EntitlementModule } from '@/modules/entitlement/entitlement.module';
import { UserModule } from '@/modules/user/user.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { ReadingBookmarkService } from './reading-bookmark.service';
import { ReadingProgressService } from './reading-progress.service';
import { ReadingSessionService } from './reading-session.service';
import { ReadingSyncService } from './reading-sync.service';
import { ReadingBookmarkPrismaRepository } from './repository/reading-bookmark-prisma.repository';
import { ReadingBookmarkRepository } from './repository/reading-bookmark.repository';
import { ReadingProgressPrismaRepository } from './repository/reading-progress-prisma.repository';
import { ReadingProgressRepository } from './repository/reading-progress.repository';
import { ReadingSessionPrismaRepository } from './repository/reading-session-prisma.repository';
import { ReadingSessionRepository } from './repository/reading-session.repository';

@Module({
  imports: [DatabaseProviderModule, BookModule, EntitlementModule, UserModule],
  providers: [
    ReadingBookmarkService,
    ReadingProgressService,
    ReadingSessionService,
    ReadingSyncService,
    { provide: ReadingBookmarkRepository, useClass: ReadingBookmarkPrismaRepository },
    { provide: ReadingProgressRepository, useClass: ReadingProgressPrismaRepository },
    { provide: ReadingSessionRepository, useClass: ReadingSessionPrismaRepository },
  ],
  exports: [
    ReadingBookmarkService,
    ReadingProgressService,
    ReadingSessionService,
    ReadingSyncService,
  ],
})
export class ReadingModule {}
