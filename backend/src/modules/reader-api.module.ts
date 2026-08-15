import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ReadingIntelligenceModule } from '@/modules/reading-intelligence/reading-intelligence.module';
import { ReadingIntelligenceReaderController } from '@/modules/reading-intelligence/reading-intelligence.reader.controller';
import { ReadingModule } from '@/modules/reading/reading.module';
import { ReadingReaderController } from '@/modules/reading/reading.reader.controller';
import { UserModule } from '@/modules/user/user.module';
import { UserReaderController } from '@/modules/user/user.reader.controller';

@Module({
  imports: [AuthModule, ReadingIntelligenceModule, ReadingModule, UserModule],
  controllers: [ReadingIntelligenceReaderController, ReadingReaderController, UserReaderController],
  providers: [JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class ReaderApiModule {}
