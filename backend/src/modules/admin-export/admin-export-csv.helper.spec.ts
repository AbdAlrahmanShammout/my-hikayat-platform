import { toCsvDocument } from '@/modules/admin-export/admin-export-csv.helper';

describe('toCsvDocument', () => {
  it('quotes formula-leading cells and escapes quotes', () => {
    const actualCsv = toCsvDocument(
      ['email', 'note'],
      [
        { email: 'reader@example.com', note: '=cmd' },
        { email: 'a"b', note: 'line\nbreak' },
      ],
    );
    expect(actualCsv).toBe(
      ['email,note', 'reader@example.com,"\'=cmd"', '"a""b","line\nbreak"'].join('\n'),
    );
  });
});
