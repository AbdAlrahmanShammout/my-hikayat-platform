import { SearchInBookRun } from '@/modules/search/defs/search-read-model-repository.defs';
import { IN_BOOK_SEARCH_EXCERPT_RADIUS } from '@/modules/search/in-book-search.constant';

export class InBookSearchHelper {
  static findMatchOffset(contentText: string, query: string): number {
    return contentText.toLowerCase().indexOf(query.toLowerCase());
  }

  static buildExcerpt(contentText: string, query: string): string {
    const matchOffset: number = InBookSearchHelper.findMatchOffset(contentText, query);
    if (matchOffset < 0) {
      return '';
    }
    const start: number = Math.max(0, matchOffset - IN_BOOK_SEARCH_EXCERPT_RADIUS);
    const end: number = Math.min(
      contentText.length,
      matchOffset + query.length + IN_BOOK_SEARCH_EXCERPT_RADIUS,
    );
    return contentText.slice(start, end);
  }

  static selectHighlightRuns(runs: readonly SearchInBookRun[], query: string): SearchInBookRun[] {
    const needle: string = query.toLowerCase();
    const directMatches: SearchInBookRun[] = runs.filter((run) =>
      run.text.toLowerCase().includes(needle),
    );
    if (directMatches.length > 0) {
      return directMatches;
    }
    return InBookSearchHelper.selectRunsOverlappingConcatenatedMatch(runs, query);
  }

  private static selectRunsOverlappingConcatenatedMatch(
    runs: readonly SearchInBookRun[],
    query: string,
  ): SearchInBookRun[] {
    const haystack: string = runs.map((run) => run.text).join('');
    const matchOffset: number = InBookSearchHelper.findMatchOffset(haystack, query);
    if (matchOffset < 0) {
      return [];
    }
    const matchEnd: number = matchOffset + query.length;
    const selected: SearchInBookRun[] = [];
    let cursor: number = 0;
    for (const run of runs) {
      const runEnd: number = cursor + run.text.length;
      if (cursor < matchEnd && runEnd > matchOffset) {
        selected.push(run);
      }
      cursor = runEnd;
    }
    return selected;
  }
}
