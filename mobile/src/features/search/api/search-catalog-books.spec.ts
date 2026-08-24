import { searchCatalogBooks } from './search-catalog-books';
import { requestJson } from '@/api/client';

jest.mock('@/api/client', () => ({
  requestJson: jest.fn(),
}));

const mockRequestJson = requestJson as jest.MockedFunction<typeof requestJson>;

describe('searchCatalogBooks', () => {
  beforeEach(() => {
    mockRequestJson.mockReset();
  });

  it('builds the search query string from provided fields', async () => {
    mockRequestJson.mockResolvedValue({ books: [], total: 0 });
    await searchCatalogBooks({
      limit: 20,
      offset: 0,
      title: 'Harbor',
      author: 'Jane',
      publisher: 'Press',
    });
    expect(mockRequestJson).toHaveBeenCalledWith({
      path: '/reader/search?limit=20&offset=0&title=Harbor&author=Jane&publisher=Press',
      method: 'GET',
    });
  });

  it('calls /reader/search with no query when filters are omitted', async () => {
    mockRequestJson.mockResolvedValue({ books: [], total: 0 });
    await searchCatalogBooks({});
    expect(mockRequestJson).toHaveBeenCalledWith({
      path: '/reader/search',
      method: 'GET',
    });
  });
});
