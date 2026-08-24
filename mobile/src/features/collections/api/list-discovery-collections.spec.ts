import { listDiscoveryCollections } from './list-discovery-collections';
import { requestJson } from '@/api/client';

jest.mock('@/api/client', () => ({
  requestJson: jest.fn(),
}));

const mockRequestJson = requestJson as jest.MockedFunction<typeof requestJson>;

describe('listDiscoveryCollections', () => {
  beforeEach(() => {
    mockRequestJson.mockReset();
  });

  it('builds the collections list query string', async () => {
    mockRequestJson.mockResolvedValue({ collections: [], total: 0 });
    await listDiscoveryCollections({ limit: 20, offset: 0 });
    expect(mockRequestJson).toHaveBeenCalledWith({
      path: '/reader/collections?limit=20&offset=0',
      method: 'GET',
    });
  });

  it('calls /reader/collections with no query when filters are omitted', async () => {
    mockRequestJson.mockResolvedValue({ collections: [], total: 0 });
    await listDiscoveryCollections({});
    expect(mockRequestJson).toHaveBeenCalledWith({
      path: '/reader/collections',
      method: 'GET',
    });
  });
});
