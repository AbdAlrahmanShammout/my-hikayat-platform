import {
  ListPublishersInput,
  PublisherBookCounts,
  PublisherListPage,
  PublisherSummaryCounts,
} from '@/modules/user/defs/publisher-directory.defs';

export abstract class PublisherDirectoryRepository {
  abstract list(input: ListPublishersInput): Promise<PublisherListPage>;
  abstract summarize(ownerId: number): Promise<PublisherSummaryCounts>;
}
