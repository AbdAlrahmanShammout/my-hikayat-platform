import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { BookModule } from '@/modules/book/book.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { StorageProviderModule } from '@/providers/storage/storage-provider.module';

import { CollectionCoverService } from './collection-cover.service';
import { CollectionDiscoveryService } from './collection-discovery.service';
import { CollectionService } from './collection.service';
import { CollectionPrismaRepository } from './repository/collection-prisma.repository';
import { CollectionRepository } from './repository/collection.repository';

@Module({
  imports: [DatabaseProviderModule, BookModule, AuditModule, StorageProviderModule],
  providers: [
    CollectionService,
    CollectionDiscoveryService,
    CollectionCoverService,
    { provide: CollectionRepository, useClass: CollectionPrismaRepository },
  ],
  exports: [CollectionService, CollectionDiscoveryService, CollectionCoverService],
})
export class CollectionModule {}
