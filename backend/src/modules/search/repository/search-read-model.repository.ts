import {
  SearchInBookRecordPage,
  SearchInBookRepoInput,
} from '@/modules/search/defs/search-read-model-repository.defs';

export abstract class SearchReadModelRepository {
  abstract searchInBook(input: SearchInBookRepoInput): Promise<SearchInBookRecordPage>;
}
