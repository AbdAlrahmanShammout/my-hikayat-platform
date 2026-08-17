import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookModule } from '@/modules/book/book.module';
import { BookReaderController } from '@/modules/book/book.reader.controller';
import { BookAssetModule } from '@/modules/book-asset/book-asset.module';
import { BookAssetReaderController } from '@/modules/book-asset/book-asset.reader.controller';
import { CategoryModule } from '@/modules/category/category.module';
import { CategoryReaderController } from '@/modules/category/category.reader.controller';
import { CollectionModule } from '@/modules/collection/collection.module';
import { CollectionReaderController } from '@/modules/collection/collection.reader.controller';
import { EntitlementModule } from '@/modules/entitlement/entitlement.module';
import { ReadingIntelligenceModule } from '@/modules/reading-intelligence/reading-intelligence.module';
import { ReadingIntelligenceReaderController } from '@/modules/reading-intelligence/reading-intelligence.reader.controller';
import { ReadingModule } from '@/modules/reading/reading.module';
import { ReadingReaderController } from '@/modules/reading/reading.reader.controller';
import { ReadingSyncReaderController } from '@/modules/reading/reading-sync.reader.controller';
import { SearchModule } from '@/modules/search/search.module';
import { SearchReaderController } from '@/modules/search/search.reader.controller';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { SubscriptionReaderController } from '@/modules/subscription/subscription.reader.controller';
import { SubscriptionWebhookController } from '@/modules/subscription/subscription.webhook.controller';
import { UserModule } from '@/modules/user/user.module';
import { UserReaderController } from '@/modules/user/user.reader.controller';

@Module({
  imports: [
    AuthModule,
    BookModule,
    BookAssetModule,
    CategoryModule,
    CollectionModule,
    EntitlementModule,
    ReadingIntelligenceModule,
    ReadingModule,
    SearchModule,
    SubscriptionModule,
    UserModule,
  ],
  controllers: [
    BookReaderController,
    BookAssetReaderController,
    CategoryReaderController,
    CollectionReaderController,
    ReadingIntelligenceReaderController,
    ReadingSyncReaderController,
    ReadingReaderController,
    SearchReaderController,
    SubscriptionReaderController,
    SubscriptionWebhookController,
    UserReaderController,
  ],
  providers: [JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class ReaderApiModule {}
