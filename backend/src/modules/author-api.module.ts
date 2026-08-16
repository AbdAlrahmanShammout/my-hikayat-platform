import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookModule } from '@/modules/book/book.module';
import { BookAuthorController } from '@/modules/book/book.author.controller';
import { BookAssetModule } from '@/modules/book-asset/book-asset.module';
import { BookAssetAuthorController } from '@/modules/book-asset/book-asset.author.controller';
import { BookProcessingModule } from '@/modules/book-processing/book-processing.module';
import { MonetizationAuthorController } from '@/modules/monetization/monetization.author.controller';
import { MonetizationModule } from '@/modules/monetization/monetization.module';

@Module({
  imports: [AuthModule, BookModule, BookAssetModule, BookProcessingModule, MonetizationModule],
  controllers: [BookAssetAuthorController, BookAuthorController, MonetizationAuthorController],
  providers: [JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class AuthorApiModule {}
