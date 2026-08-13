import { TransactionContext } from '@/common/base/transaction-context';

export abstract class TransactionRunner {
  abstract run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T>;
}
