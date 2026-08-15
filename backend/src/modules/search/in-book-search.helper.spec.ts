import { SearchInBookRun } from '@/modules/search/defs/search-read-model-repository.defs';

import { InBookSearchHelper } from './in-book-search.helper';

describe('InBookSearchHelper', () => {
  describe('findMatchOffset', () => {
    it('finds the first case-insensitive match', () => {
      const actualOffset = InBookSearchHelper.findMatchOffset('The Harbor lights', 'harbor');
      expect(actualOffset).toBe(4);
    });
  });

  describe('buildExcerpt', () => {
    it('returns a window around the first match', () => {
      const actualExcerpt = InBookSearchHelper.buildExcerpt(
        'The Harbor lights were visible from the ridge.',
        'Harbor',
      );
      expect(actualExcerpt).toContain('Harbor');
      expect(actualExcerpt).toContain('lights');
    });

    it('returns an empty excerpt when the query is missing', () => {
      const actualExcerpt = InBookSearchHelper.buildExcerpt('The Harbor lights', 'mountain');
      expect(actualExcerpt).toBe('');
    });
  });

  describe('selectHighlightRuns', () => {
    const inputRuns: SearchInBookRun[] = [
      { text: 'The ', x: 10, y: 20, width: 20, height: 12 },
      { text: 'Harbor', x: 120, y: 80, width: 80, height: 20 },
      { text: ' lights', x: 200, y: 80, width: 60, height: 20 },
    ];

    it('returns runs whose text contains the query', () => {
      const actualRuns = InBookSearchHelper.selectHighlightRuns(inputRuns, 'HARBOR');
      expect(actualRuns).toEqual([inputRuns[1]]);
    });

    it('returns concatenated runs when the query spans two runs', () => {
      const actualRuns = InBookSearchHelper.selectHighlightRuns(inputRuns, 'Harbor lights');
      expect(actualRuns).toEqual([inputRuns[1], inputRuns[2]]);
    });
  });
});
