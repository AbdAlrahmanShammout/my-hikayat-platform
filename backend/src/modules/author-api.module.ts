import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookAuthorController } from '@/modules/book/book.author.controller';
import { BookAssetModule } from '@/modules/book-asset/book-asset.module';
import { BookAssetAuthorController } from '@/modules/book-asset/book-asset.author.controller';
import { BookProcessingModule } from '@/modules/book-processing/book-processing.module';

@Module({
  imports: [AuthModule, BookAssetModule, BookProcessingModule],
  controllers: [BookAssetAuthorController, BookAuthorController],
  providers: [JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class AuthorApiModule {}
