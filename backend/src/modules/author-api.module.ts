import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookAssetModule } from '@/modules/book-asset/book-asset.module';
import { BookAssetAuthorController } from '@/modules/book-asset/book-asset.author.controller';

@Module({
  imports: [AuthModule, BookAssetModule],
  controllers: [BookAssetAuthorController],
  providers: [JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class AuthorApiModule {}
