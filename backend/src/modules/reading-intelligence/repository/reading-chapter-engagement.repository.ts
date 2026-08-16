import { TransactionContext } from '@/common/base/transaction-context';
import {
  AddReadingChapterEngagementDurationsRepoInput,
  BookChapterDurationTotal,
  ChapterDurationTotal,
  ListReadingChapterEngagementsRepoInput,
  ReadingChapterEngagementPage,
  SumChapterEngagementRepoInput,
  SumReadingChapterEngagementDurationsRepoInput,
} from '@/modules/reading-intelligence/defs/reading-chapter-engagement-repository.defs';
import { ReadingChapterEngagementEntity } from '@/modules/reading-intelligence/entity/reading-chapter-engagement.entity';

export abstract class ReadingChapterEngagementRepository {
  abstract addDurations(
    input: AddReadingChapterEngagementDurationsRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingChapterEngagementEntity>;
  abstract list(
    input: ListReadingChapterEngagementsRepoInput,
  ): Promise<ReadingChapterEngagementPage>;
  abstract findById(id: number): Promise<ReadingChapterEngagementEntity | null>;
  abstract sumDurationsByBookInRange(
    input: SumReadingChapterEngagementDurationsRepoInput,
  ): Promise<BookChapterDurationTotal[]>;
  abstract sumDurationsByChapterInRange(
    input: SumChapterEngagementRepoInput,
  ): Promise<ChapterDurationTotal[]>;
}
