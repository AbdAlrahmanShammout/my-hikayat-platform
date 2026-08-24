import { getDiscoveryCollection } from './get-discovery-collection';
import { requestJson } from '@/api/client';

jest.mock('@/api/client', () => ({
  requestJson: jest.fn(),
}));

const mockRequestJson = requestJson as jest.MockedFunction<typeof requestJson>;

describe('getDiscoveryCollection', () => {
  beforeEach(() => {
    mockRequestJson.mockReset();
  });

  it('requests the collection detail path', async () => {
    mockRequestJson.mockResolvedValue({
      id: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      title: 'Harbor Picks',
      books: [],
    });
    await getDiscoveryCollection(3);
    expect(mockRequestJson).toHaveBeenCalledWith({
      path: '/reader/collections/3',
      method: 'GET',
    });
  });
});
