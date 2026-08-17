import { Module } from '@nestjs/common';

import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { EncryptionProviderModule } from '@/providers/encryption/encryption-provider.module';
import { JobProviderModule } from '@/providers/job/job-provider.module';
import { JwtProviderModule } from '@/providers/jwt/jwt-provider.module';
import { MailProviderModule } from '@/providers/mail/mail-provider.module';
import { StorageProviderModule } from '@/providers/storage/storage-provider.module';
import { StripeProviderModule } from '@/providers/stripe/stripe-provider.module';

@Module({
  imports: [
    DatabaseProviderModule,
    JwtProviderModule,
    StorageProviderModule,
    EncryptionProviderModule,
    JobProviderModule,
    StripeProviderModule,
    MailProviderModule,
  ],
  exports: [
    DatabaseProviderModule,
    JwtProviderModule,
    StorageProviderModule,
    EncryptionProviderModule,
    JobProviderModule,
    StripeProviderModule,
    MailProviderModule,
  ],
})
export class ProviderModule {}
