import { TransactionContext } from '@/common/base/transaction-context';
import {
  AddReadingVisualEngagementDurationsRepoInput,
  BookVisualDurationTotal,
  ListReadingVisualEngagementsRepoInput,
  ReadingVisualEngagementPage,
  SpreadVisualDurationTotal,
  SumReadingVisualEngagementDurationsRepoInput,
  SumSpreadVisualEngagementRepoInput,
} from '@/modules/reading-intelligence/defs/reading-visual-engagement-repository.defs';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';

export abstract class ReadingVisualEngagementRepository {
  abstract addDurations(
    input: AddReadingVisualEngagementDurationsRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingVisualEngagementEntity>;
  abstract list(input: ListReadingVisualEngagementsRepoInput): Promise<ReadingVisualEngagementPage>;
  abstract findById(id: number): Promise<ReadingVisualEngagementEntity | null>;
  abstract sumDurationsByBookInRange(
    input: SumReadingVisualEngagementDurationsRepoInput,
  ): Promise<BookVisualDurationTotal[]>;
  abstract sumDurationsBySpreadInRange(
    input: SumSpreadVisualEngagementRepoInput,
  ): Promise<SpreadVisualDurationTotal[]>;
}
