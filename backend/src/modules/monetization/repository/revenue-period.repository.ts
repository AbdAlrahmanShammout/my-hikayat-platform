import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateRevenuePeriodRepoInput,
  ListRevenuePeriodsRepoInput,
  RevenuePeriodPage,
  UpdateRevenuePeriodRepoInput,
} from '@/modules/monetization/defs/revenue-period-repository.defs';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';

export abstract class RevenuePeriodRepository {
  abstract create(
    input: CreateRevenuePeriodRepoInput,
    context?: TransactionContext,
  ): Promise<RevenuePeriodEntity>;
  abstract update(
    input: UpdateRevenuePeriodRepoInput,
    context?: TransactionContext,
  ): Promise<RevenuePeriodEntity>;
  abstract findById(id: number): Promise<RevenuePeriodEntity | null>;
  abstract findByStartsAt(startsAt: Date): Promise<RevenuePeriodEntity | null>;
  abstract findOpen(): Promise<RevenuePeriodEntity | null>;
  abstract findOpenElapsed(endsAtOnOrBefore: Date): Promise<RevenuePeriodEntity[]>;
  abstract list(input: ListRevenuePeriodsRepoInput): Promise<RevenuePeriodPage>;
}
