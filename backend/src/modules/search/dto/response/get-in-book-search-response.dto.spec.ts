import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { GetInBookSearchResponseDto } from './get-in-book-search-response.dto';

describe('GetInBookSearchResponseDto', () => {
  it('maps an in-book search page into the collection envelope', () => {
    const actualResponse = new GetInBookSearchResponseDto({
      hits: [
        {
          layoutType: BookLayoutType.REFLOWABLE,
          spineIndex: 0,
          pageNumber: null,
          spreadIndex: null,
          title: 'Dawn Watch',
          excerpt: 'The Harbor lights',
          matchOffset: 4,
          highlights: [],
        },
      ],
      total: 3,
    });
    expect(actualResponse.total).toBe(3);
    expect(actualResponse.hits).toHaveLength(1);
    expect(actualResponse.hits[0].title).toBe('Dawn Watch');
    expect(actualResponse.hits[0].matchOffset).toBe(4);
  });
});
