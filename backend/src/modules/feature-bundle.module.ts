import { Module } from '@nestjs/common';

import { AdminApiModule } from './admin-api.module';
import { AuthorApiModule } from './author-api.module';
import { ReaderApiModule } from './reader-api.module';

@Module({
  imports: [ReaderApiModule, AuthorApiModule, AdminApiModule],
})
export class FeatureBundleModule {}
