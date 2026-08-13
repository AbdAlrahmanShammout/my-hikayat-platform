import { Global, Module } from '@nestjs/common';

import { TransactionRunner } from '@/common/base/transaction-runner';

import { PrismaProviderService } from './prisma-provider.service';
import { PrismaTransactionRunner } from './prisma-transaction-runner';

@Global()
@Module({
  providers: [
    PrismaProviderService,
    { provide: TransactionRunner, useClass: PrismaTransactionRunner },
  ],
  exports: [PrismaProviderService, TransactionRunner],
})
export class PrismaProviderModule {}
