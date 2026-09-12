import { rememberSearchRecent, readSearchRecents, type SearchRecent } from './search-recents-storage';
import { readLocalValue, writeLocalValue } from '@/storage/local-storage';

jest.mock('@/storage/local-storage', () => ({
  readLocalValue: jest.fn(),
  writeLocalValue: jest.fn(),
}));

const mockReadLocalValue = readLocalValue as jest.MockedFunction<typeof readLocalValue>;
const mockWriteLocalValue = writeLocalValue as jest.MockedFunction<typeof writeLocalValue>;

describe('search recents storage', () => {
  beforeEach(() => {
    mockReadLocalValue.mockReset();
    mockWriteLocalValue.mockReset();
  });

  it('returns an empty list when nothing is stored', async () => {
    mockReadLocalValue.mockResolvedValue(null);
    const actualRecents: SearchRecent[] = await readSearchRecents();
    expect(actualRecents).toEqual([]);
  });

  it('prepends a new recent and drops duplicates', async () => {
    mockReadLocalValue.mockResolvedValue(
      JSON.stringify([{ query: 'old', field: 'title' }]),
    );
    mockWriteLocalValue.mockResolvedValue(undefined);
    const actualRecents = await rememberSearchRecent({ query: '  Moon  ', field: 'title' });
    expect(actualRecents[0]).toEqual({ query: 'Moon', field: 'title' });
    expect(mockWriteLocalValue).toHaveBeenCalled();
  });
});
