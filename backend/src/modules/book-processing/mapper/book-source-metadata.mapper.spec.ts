import { BookSourceMetadataMapper } from './book-source-metadata.mapper';

describe('BookSourceMetadataMapper', () => {
  it('maps a persistence payload to the domain entity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = BookSourceMetadataMapper.toEntity({
      id: 3,
      createdAt,
      updatedAt,
      deletedAt: null,
      bookId: 8,
      packagePath: 'OEBPS/content.opf',
      epubVersion: '3.0',
      identifier: 'urn:uuid:test',
      title: 'The Last Lighthouse',
      language: 'en',
      creator: 'Jane Author',
      publisher: null,
      description: 'A reflowable chapter book.',
    });
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.title).toBe('The Last Lighthouse');
    expect(actualEntity.creator).toBe('Jane Author');
    expect(actualEntity.description).toBe('A reflowable chapter book.');
  });
});
