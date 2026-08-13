import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

class PrismaTransactionContext extends TransactionContext {
  constructor(readonly client: Prisma.TransactionClient) {
    super();
  }
}

export type PrismaClientLike = PrismaProviderService | Prisma.TransactionClient;

export function resolvePrismaTransactionClient(
  prismaProviderService: PrismaProviderService,
  context?: TransactionContext,
): PrismaClientLike {
  if (context === undefined) {
    return prismaProviderService;
  }
  if (!(context instanceof PrismaTransactionContext)) {
    throw new Error('TransactionContext was not created by PrismaTransactionRunner');
  }
  return context.client;
}

@Injectable()
export class PrismaTransactionRunner extends TransactionRunner {
  constructor(private readonly prismaProviderService: PrismaProviderService) {
    super();
  }

  async run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T> {
    return this.prismaProviderService.$transaction(async (transactionClient) => {
      return work(new PrismaTransactionContext(transactionClient));
    });
  }
}
