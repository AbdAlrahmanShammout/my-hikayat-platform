import { TransactionContext } from '@/common/base/transaction-context';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import {
  PrismaTransactionRunner,
  resolvePrismaTransactionClient,
} from '@/providers/database/prisma/prisma-transaction-runner';

class ForeignTransactionContext extends TransactionContext {
  constructor() {
    super();
  }
}

describe('PrismaTransactionRunner', () => {
  const mockTransactionClient = { marker: 'tx' };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
  };
  let prismaTransactionRunner: PrismaTransactionRunner;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(
        async (work: (client: typeof mockTransactionClient) => Promise<unknown>) => {
          return work(mockTransactionClient);
        },
      ),
    };
    prismaTransactionRunner = new PrismaTransactionRunner(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('runs work inside an ORM transaction and yields an opaque context', async () => {
    const actualResult = await prismaTransactionRunner.run((context) => {
      expect(context).toBeInstanceOf(TransactionContext);
      expect(context).not.toHaveProperty('$transaction');
      const actualClient = resolvePrismaTransactionClient(
        mockPrismaProviderService as unknown as PrismaProviderService,
        context,
      );
      expect(actualClient).toBe(mockTransactionClient);
      return Promise.resolve('committed');
    });
    expect(actualResult).toBe('committed');
    expect(mockPrismaProviderService.$transaction).toHaveBeenCalledTimes(1);
  });
});

describe('resolvePrismaTransactionClient', () => {
  const mockPrismaProviderService = {} as PrismaProviderService;

  it('returns the provider client when no context is supplied', () => {
    const actualClient = resolvePrismaTransactionClient(mockPrismaProviderService);
    expect(actualClient).toBe(mockPrismaProviderService);
  });

  it('rejects a context that was not created by the Prisma runner', () => {
    const foreignContext = new ForeignTransactionContext();
    expect(() => {
      resolvePrismaTransactionClient(mockPrismaProviderService, foreignContext);
    }).toThrow('TransactionContext was not created by PrismaTransactionRunner');
  });
});
