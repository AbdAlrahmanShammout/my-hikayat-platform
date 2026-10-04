import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { MonetizationModule } from '@/modules/monetization/monetization.module';
import { PublisherDirectoryService } from '@/modules/user/publisher-directory.service';
import { PublisherDirectoryPrismaRepository } from '@/modules/user/repository/publisher-directory-prisma.repository';
import { PublisherDirectoryRepository } from '@/modules/user/repository/publisher-directory.repository';
import { UserModule } from '@/modules/user/user.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

@Module({
  imports: [DatabaseProviderModule, UserModule, BookModule, MonetizationModule],
  providers: [
    PublisherDirectoryService,
    { provide: PublisherDirectoryRepository, useClass: PublisherDirectoryPrismaRepository },
  ],
  exports: [PublisherDirectoryService],
})
export class PublisherDirectoryModule {}
