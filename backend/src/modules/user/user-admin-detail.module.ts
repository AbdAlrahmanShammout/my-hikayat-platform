import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { BookAssetModule } from '@/modules/book-asset/book-asset.module';
import { BookProcessingModule } from '@/modules/book-processing/book-processing.module';
import { ReadingModule } from '@/modules/reading/reading.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { UserModule } from '@/modules/user/user.module';
import { UserAdminDetailService } from '@/modules/user/user-admin-detail.service';

@Module({
  imports: [
    UserModule,
    SubscriptionModule,
    ReadingModule,
    BookModule,
    BookProcessingModule,
    BookAssetModule,
  ],
  providers: [UserAdminDetailService],
  exports: [UserAdminDetailService],
})
export class UserAdminDetailModule {}
